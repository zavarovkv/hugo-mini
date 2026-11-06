# Hugo Mini starter

A small, ready-to-edit Hugo blog powered by [Hugo Mini](https://github.com/zavarovkv/hugo-mini).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzavarovkv%2Fhugo-mini%2Ftree%2Fmain%2Fstarter&project-name=my-mini-blog&repository-name=my-mini-blog)

The button clones **this starter directory** into a new Git repository in your account and deploys it to Vercel. No frontend framework or npm install is needed.

## Customize your site

1. Set your title and name in [`hugo.toml`](hugo.toml).
2. Replace the introduction in [`content/_index.md`](content/_index.md) and the [About page](content/about.md).
3. Edit or remove [`content/blog/hello-world.md`](content/blog/hello-world.md) and write your own posts.
4. Commit and push to publish changes through Vercel.

To have absolute canonical URLs from the first build, enable **Automatically expose System Environment Variables** in Vercel project settings, or set `baseURL` for your custom domain in `hugo.toml`. Without Vercel's system URL, the build uses site-root relative links.

## Run locally

Install [Hugo Extended 0.146+](https://gohugo.io/installation/) and Git, then run from the starter's root:

```bash
bash scripts/setup-theme.sh
hugo server -D
```

Open `http://localhost:1313/`. Publish a new post with:

```bash
hugo new content blog/my-next-post.md
```

## Updates and reproducible builds

The installer fetches Hugo Mini **v3.4.0** and verifies its exact commit. The Vercel build script downloads the official Hugo Extended **0.169.0** release and checks its SHA-256 before executing it. To upgrade the theme, change both `theme_tag` and `theme_sha` in [`scripts/setup-theme.sh`](scripts/setup-theme.sh), then re-run setup with the old `themes/` directory removed. Keep the checksums and version updated together.

This starter's generated `themes/`, `public/`, and `resources/` directories are ignored by Git. For advanced multilingual, SEO, and component settings, see the [theme documentation](https://github.com/zavarovkv/hugo-mini#documentation).
