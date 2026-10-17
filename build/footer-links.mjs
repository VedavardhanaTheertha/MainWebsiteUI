export function resolveFooterLinks(content, connections, source) {
  const social = content.footer.social.map((entry) => {
    const link = connections.find((candidate) => candidate.id === entry.connectId);
    if (!link) throw new Error(`${source}: footer.social references unknown connectId "${entry.connectId}".`);
    const url = new URL(link.url);
    if (url.protocol !== "https:" || url.username || url.password) {
      throw new Error(`${source}: footer.social "${entry.connectId}" requires a public HTTPS destination.`);
    }
    return { ...entry, href: link.url };
  });
  return { ...content, footer: { ...content.footer, social } };
}
