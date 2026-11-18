# Hugo Mini starter

A ready-to-edit [Hugo Mini](https://github.com/zavarovkv/hugo-mini) blog with a homepage, About page, sample article and full-text search.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzavarovkv%2Fhugo-mini%2Ftree%2Fmain%2Fstarter&project-name=my-mini-blog&repository-name=my-mini-blog)

The button copies the starter into your own repository. Vercel builds the site and search index on each deployment.

## Customize your site

1. Set your title and name in [`hugo.toml`](hugo.toml).
2. Replace the introduction in [`content/_index.md`](content/_index.md) and the [About page](content/about.md).
3. Edit or remove [`content/blog/hello-world.md`](content/blog/hello-world.md) and write your own posts.
4. Commit and push to publish changes through Vercel.

For canonical URLs:

- **Custom domain:** set `HUGO_BASEURL`, such as `https://blog.example.org/`.
- **Vercel domain:** enable **Automatically expose System Environment Variables** in project settings.
- Otherwise, the build uses `baseURL` from `hugo.toml` (relative URLs by default).

## Run locally

Install [Hugo Extended 0.146+](https://gohugo.io/installation/), Git and Node.js 22.12+, then run from the starter's root:

```bash
bash scripts/setup-theme.sh
npm ci
npm run dev -- --buildDrafts
```

Open `http://localhost:1313/`. After stopping the server with `Ctrl+C`, create a post:

```bash
hugo new content blog/my-next-post.md
```

Restart the preview to see the draft. Set `draft = false` to publish it and include it in search. To build locally, run `npm run build` and publish the whole `public/` directory. [Search and exclusions](https://github.com/zavarovkv/hugo-mini/blob/main/docs/search.md)

## Updates

- **Theme:** Hugo Mini is pinned to a reviewed commit SHA. Review the [changelog](https://github.com/zavarovkv/hugo-mini/blob/main/CHANGELOG.md), update `theme_sha` in [`setup-theme.sh`](scripts/setup-theme.sh), save any local theme edits, remove the generated `themes/hugo-mini/`, then rerun setup.
- **Vercel build:** The build verifies the Hugo Extended download. Update its pinned version and SHA-256 checksum together in [`build-vercel.sh`](scripts/build-vercel.sh).
- Generated `themes/`, `public/` and `resources/` stay out of Git.

[Theme documentation](https://github.com/zavarovkv/hugo-mini/blob/main/docs/README.md) · [Deployment details](https://github.com/zavarovkv/hugo-mini/blob/main/docs/deployment.md#one-click-blog-starter-on-vercel)
