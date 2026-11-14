# Hugo Mini starter

A small, ready-to-edit Hugo blog powered by [Hugo Mini](https://github.com/zavarovkv/hugo-mini).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzavarovkv%2Fhugo-mini%2Ftree%2Fmain%2Fstarter&project-name=my-mini-blog&repository-name=my-mini-blog)

The button copies this starter into your own repository and deploys it. No npm install needed.

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

Install [Hugo Extended 0.146+](https://gohugo.io/installation/) and Git, then run from the starter's root:

```bash
bash scripts/setup-theme.sh
hugo server -D
```

Open `http://localhost:1313/`. Create a post with:

```bash
hugo new content blog/my-next-post.md
```

## Updates

- **Theme:** Hugo Mini v3.5.0, verified by commit SHA. Update `theme_tag` and `theme_sha` together in [`setup-theme.sh`](scripts/setup-theme.sh), remove the old `themes/`, then rerun setup.
- **Vercel build:** Hugo Extended 0.169.0, verified by SHA-256. Update the version and checksum together in [`build-vercel.sh`](scripts/build-vercel.sh).
- Generated `themes/`, `public/` and `resources/` stay out of Git.

[Theme documentation](https://github.com/zavarovkv/hugo-mini#documentation) · [Deployment details](https://github.com/zavarovkv/hugo-mini/blob/main/docs/deployment.md#one-click-blog-starter-on-vercel)
