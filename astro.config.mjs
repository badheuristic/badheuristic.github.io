// @ts-check
import { defineConfig } from 'astro/config';
import mermaid from "astro-mermaid";
import favicons from "astro-favicons";

// https://astro.build/config
export default defineConfig({
    site: 'https://ubzrst.github.io',
    integrations: [
        mermaid({ theme: 'default', autoTheme: true }),
        favicons({
            input: "./src/favicon.png",
            name: "ubzrst",
            short_name: "ubzrst",
        }),
    ],
});
