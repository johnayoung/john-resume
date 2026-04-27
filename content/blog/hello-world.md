---
title: "Hello, World"
date: 2026-04-27
draft: false
description: "Kicking off the blog with a quick note and a Go snippet to verify syntax highlighting."
---

This is the first post on the new blog. It exists mostly to verify that
the Hugo build, the layout, and code block syntax highlighting all work.

## A small Go snippet

Here is a short Go program that prints a greeting and a count:

```go
package main

import (
	"fmt"
	"strings"
)

func greet(names []string) string {
	if len(names) == 0 {
		return "Hello, world!"
	}
	return fmt.Sprintf("Hello, %s!", strings.Join(names, ", "))
}

func main() {
	fmt.Println(greet(nil))
	fmt.Println(greet([]string{"John", "Hugo"}))
}
```

If you can read keywords like `package`, `import`, and `func` in their own
color, syntax highlighting is working.

## What's next

More posts will land here over time — mostly engineering notes from work on
AI agent systems, DeFi routing, and trading infrastructure.
