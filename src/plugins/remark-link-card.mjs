import ogs from 'open-graph-scraper';
import { visit } from 'unist-util-visit';

function resolveUrl(maybeRelativeUrl, baseUrl) {
  if (!maybeRelativeUrl) return '';

  try {
    return new URL(maybeRelativeUrl, baseUrl).toString();
  } catch {
    return '';
  }
}

export function remarkLinkCard() {
  return async (tree) => {
    const promises = [];

    visit(tree, 'paragraph', (node, index, parent) => {
      const nonWhitespaceChildren = node.children.filter(child =>
        !(child.type === 'text' && /^\s*$/.test(child.value))
      );

      if (nonWhitespaceChildren.length !== 1 || nonWhitespaceChildren[0].type !== 'link') {
        return;
      }

      const linkNode = nonWhitespaceChildren[0];
      const url = linkNode.url;

      const linkTextNode = linkNode.children[0];
      const linkText = linkTextNode?.value ?? '';

      if (!linkTextNode || linkText.trim() !== url.trim()) {
        return;
      }

      const promise = ogs({ url, timeout: 10000 })
        .then(({ result }) => {
          if (!result?.success) return;

          const title = result.ogTitle || result.twitterTitle || url;
          const description = result.ogDescription || result.twitterDescription || '';

          const image = resolveUrl(
            result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url,
            url
          );

          const favicon = resolveUrl(result.favicon, url);
          const domain = new URL(url).hostname;

          const html = `
            <a href="${url}" class="link-card not-prose block my-4 rounded-sm overflow-hidden border border-gray-500/20 no-underline bg-white md:h-32" target="_blank" rel="noopener noreferrer">
              <div class="flex flex-col md:flex-row h-full">
                <div class="p-4 flex flex-col justify-center gap-2 flex-1 order-2 md:order-1">
                  <div class="font-bold text-gray-800 line-clamp-2 leading-tight">${title}</div>
                  <div class="text-sm text-gray-500 line-clamp-2 md:line-clamp-1">${description}</div>
                  <div class="flex items-center gap-2 mt-auto">
                    ${favicon ? `<img src="${favicon}" class="w-4 h-4 rounded-sm no-zoom" alt="" />` : ''}
                    <span class="text-xs text-gray-400">${domain}</span>
                  </div>
                </div>

                ${image ? `
                <div class="w-full md:w-1/3 aspect-video md:aspect-auto relative shrink-0 order-1 md:order-2">
                  <Image src="${image}" class="w-full h-full object-cover no-zoom" loading="lazy" decoding="async" alt="" />
                </div>
                ` : ''}
              </div>
            </a>
          `;

          parent.children.splice(index, 1, {
            type: 'html',
            value: html
          });
        })
        .catch(() => { });

      promises.push(promise);
    });

    await Promise.all(promises);
  };
}