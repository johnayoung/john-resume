// og-gen renders 1200x630 social preview cards for every published Hugo blog
// post. Output PNGs land in static/og/<slug>.png and are picked up by the
// Hugo build via the existing static/ pipeline.
package main

import (
	"flag"
	"fmt"
	"image/color"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/fogleman/gg"
	"github.com/golang/freetype/truetype"
	"golang.org/x/image/font"
	"golang.org/x/image/font/gofont/gobold"
	"golang.org/x/image/font/gofont/goregular"
)

const (
	cardW = 1200
	cardH = 630
	pad   = 72
)

var (
	bgColor     = mustHex("#1a1a2e")
	accentColor = mustHex("#E03A3E")
	titleColor  = color.RGBA{R: 255, G: 255, B: 255, A: 255}
	bylineColor = mustHex("#9ca3af")
)

func mustHex(hex string) color.RGBA {
	hex = strings.TrimPrefix(hex, "#")
	var r, g, b uint8
	if _, err := fmt.Sscanf(hex, "%02x%02x%02x", &r, &g, &b); err != nil {
		panic(err)
	}
	return color.RGBA{R: r, G: g, B: b, A: 255}
}

type post struct {
	slug  string
	title string
}

var (
	titleRE = regexp.MustCompile(`(?m)^title:\s*"([^"]+)"\s*$`)
	draftRE = regexp.MustCompile(`(?m)^draft:\s*(true|false)\s*$`)
)

func parsePost(path string) (*post, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	body := string(data)
	if !strings.HasPrefix(body, "---") {
		return nil, nil
	}
	rest := body[3:]
	end := strings.Index(rest, "\n---")
	if end == -1 {
		return nil, fmt.Errorf("%s: unterminated frontmatter", path)
	}
	fm := rest[:end]
	if m := draftRE.FindStringSubmatch(fm); m != nil && m[1] == "true" {
		return nil, nil
	}
	tm := titleRE.FindStringSubmatch(fm)
	if tm == nil {
		return nil, fmt.Errorf("%s: missing or unparseable title", path)
	}
	slug := strings.TrimSuffix(filepath.Base(path), ".md")
	return &post{slug: slug, title: tm[1]}, nil
}

func loadFace(data []byte, size float64) (font.Face, error) {
	f, err := truetype.Parse(data)
	if err != nil {
		return nil, err
	}
	return truetype.NewFace(f, &truetype.Options{Size: size, DPI: 72, Hinting: font.HintingFull}), nil
}

func render(p *post, outPath string) error {
	dc := gg.NewContext(cardW, cardH)
	dc.SetColor(bgColor)
	dc.Clear()

	brand, err := loadFace(goregular.TTF, 32)
	if err != nil {
		return err
	}
	byline, err := loadFace(goregular.TTF, 28)
	if err != nil {
		return err
	}

	titleSize := 64.0
	titleFace, err := loadFace(gobold.TTF, titleSize)
	if err != nil {
		return err
	}

	dc.SetFontFace(brand)
	dc.SetColor(accentColor)
	dc.DrawStringAnchored("jyoung.dev", pad, pad, 0, 1)

	dc.SetFontFace(byline)
	dc.SetColor(bylineColor)
	dc.DrawStringAnchored("John Young", pad, cardH-pad, 0, 0)

	dc.SetFontFace(titleFace)
	dc.SetColor(titleColor)
	dc.DrawStringWrapped(
		p.title,
		float64(cardW)/2, float64(cardH)/2,
		0.5, 0.5,
		float64(cardW-2*pad),
		1.25,
		gg.AlignCenter,
	)

	if err := os.MkdirAll(filepath.Dir(outPath), 0o755); err != nil {
		return err
	}
	return dc.SavePNG(outPath)
}

func main() {
	contentDir := flag.String("content", "content/blog", "directory of blog post markdown files")
	outDir := flag.String("out", "static/og", "directory to write generated PNGs into")
	flag.Parse()

	entries, err := os.ReadDir(*contentDir)
	if err != nil {
		log.Fatalf("read content dir: %v", err)
	}

	count := 0
	for _, e := range entries {
		name := e.Name()
		if e.IsDir() || !strings.HasSuffix(name, ".md") || strings.HasPrefix(name, "_") {
			continue
		}
		p, err := parsePost(filepath.Join(*contentDir, name))
		if err != nil {
			log.Fatalf("parse %s: %v", name, err)
		}
		if p == nil {
			continue
		}
		out := filepath.Join(*outDir, p.slug+".png")
		if err := render(p, out); err != nil {
			log.Fatalf("render %s: %v", p.slug, err)
		}
		fmt.Printf("wrote %s\n", out)
		count++
	}
	fmt.Printf("%d card(s) generated\n", count)
}
