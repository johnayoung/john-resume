// og-gen renders 1200x630 social preview cards for every published Hugo blog
// post. Output PNGs land in static/og/<slug>.png and are picked up by the
// Hugo build via the existing static/ pipeline.
package main

import (
	"encoding/json"
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

// renderDefault draws the site-wide fallback card used by every page without
// a card of its own (home, about, subscribe, work-with-me, the blog index).
// Referenced from hugo.toml as params.ogImage.
func renderDefault(outPath string) error {
	dc := gg.NewContext(cardW, cardH)
	dc.SetColor(bgColor)
	dc.Clear()

	brand, err := loadFace(goregular.TTF, 32)
	if err != nil {
		return err
	}
	title, err := loadFace(gobold.TTF, 84)
	if err != nil {
		return err
	}
	sub, err := loadFace(goregular.TTF, 34)
	if err != nil {
		return err
	}

	dc.SetFontFace(brand)
	dc.SetColor(accentColor)
	dc.DrawStringAnchored("jyoung.dev", pad, pad, 0, 1)

	dc.SetFontFace(title)
	dc.SetColor(titleColor)
	dc.DrawStringAnchored("John Young", float64(cardW)/2, 270, 0.5, 0.5)

	dc.SetFontFace(sub)
	dc.SetColor(bylineColor)
	dc.DrawStringWrapped(
		"Research-backed essays on running AI coding agents in production",
		float64(cardW)/2, 360, 0.5, 0, float64(cardW-3*pad), 1.4, gg.AlignCenter,
	)

	if err := os.MkdirAll(filepath.Dir(outPath), 0o755); err != nil {
		return err
	}
	return dc.SavePNG(outPath)
}

// researchData is the subset of data/research.json the card needs. Reading it
// at build time keeps the card's counts in sync with the index's source of truth.
type researchData struct {
	Updated string `json:"updated"`
	Pillars []struct {
		ID int `json:"id"`
	} `json:"pillars"`
	Sources []struct {
		Class string `json:"class"`
	} `json:"sources"`
}

// renderResearch draws the /research/ card. It's stat-forward rather than
// title-only so the card reads as a dataset, not another blog post.
func renderResearch(rd *researchData, outPath string) error {
	dc := gg.NewContext(cardW, cardH)
	dc.SetColor(bgColor)
	dc.Clear()

	brand, err := loadFace(goregular.TTF, 32)
	if err != nil {
		return err
	}
	title, err := loadFace(gobold.TTF, 68)
	if err != nil {
		return err
	}
	sub, err := loadFace(goregular.TTF, 30)
	if err != nil {
		return err
	}
	meta, err := loadFace(goregular.TTF, 28)
	if err != nil {
		return err
	}

	dc.SetFontFace(brand)
	dc.SetColor(accentColor)
	dc.DrawStringAnchored("jyoung.dev", pad, pad, 0, 1)

	dc.SetFontFace(title)
	dc.SetColor(titleColor)
	dc.DrawStringAnchored("The Research Index", float64(cardW)/2, 250, 0.5, 0.5)

	dc.SetFontFace(sub)
	dc.SetColor(bylineColor)
	subtitle := fmt.Sprintf(
		"%d verified primary sources on engineering practices for AI coding agents",
		len(rd.Sources),
	)
	dc.DrawStringWrapped(subtitle, float64(cardW)/2, 340, 0.5, 0, float64(cardW-3*pad), 1.4, gg.AlignCenter)

	dc.SetFontFace(meta)
	dc.SetColor(bylineColor)
	dc.DrawStringAnchored("John Young", pad, cardH-pad, 0, 0)
	dc.SetColor(accentColor)
	dc.DrawStringAnchored(
		fmt.Sprintf("%d themes · updated %s", len(rd.Pillars), rd.Updated),
		cardW-pad, cardH-pad, 1, 0,
	)

	if err := os.MkdirAll(filepath.Dir(outPath), 0o755); err != nil {
		return err
	}
	return dc.SavePNG(outPath)
}

func main() {
	contentDir := flag.String("content", "content/blog", "directory of blog post markdown files")
	outDir := flag.String("out", "static/og", "directory to write generated PNGs into")
	dataPath := flag.String("research-data", "", "path to data/research.json (default: derived from -content as <content>/../../data/research.json)")
	flag.Parse()

	researchJSON := *dataPath
	if researchJSON == "" {
		researchJSON = filepath.Join(*contentDir, "..", "..", "data", "research.json")
	}

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

	// The public report teaser lives at the content root, outside -content.
	reportPath := filepath.Join(*contentDir, "..", "state-of-ai-coding-agent-engineering.md")
	rp, err := parsePost(reportPath)
	if err != nil {
		log.Fatalf("parse %s: %v", reportPath, err)
	}
	if rp != nil {
		out := filepath.Join(*outDir, rp.slug+".png")
		if err := render(rp, out); err != nil {
			log.Fatalf("render %s: %v", rp.slug, err)
		}
		fmt.Printf("wrote %s\n", out)
		count++
	}

	defaultOut := filepath.Join(*outDir, "default.png")
	if err := renderDefault(defaultOut); err != nil {
		log.Fatalf("render default card: %v", err)
	}
	fmt.Printf("wrote %s\n", defaultOut)
	count++

	rdBytes, err := os.ReadFile(researchJSON)
	if err != nil {
		log.Fatalf("read research data %s: %v", researchJSON, err)
	}
	var rd researchData
	if err := json.Unmarshal(rdBytes, &rd); err != nil {
		log.Fatalf("parse research data %s: %v", researchJSON, err)
	}
	researchOut := filepath.Join(*outDir, "research.png")
	if err := renderResearch(&rd, researchOut); err != nil {
		log.Fatalf("render research card: %v", err)
	}
	fmt.Printf("wrote %s\n", researchOut)
	count++

	fmt.Printf("%d card(s) generated\n", count)
}
