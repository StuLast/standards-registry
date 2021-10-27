describe('Standards', () => {
  it('should be able to access a content standards model', async () => {
      await browser.url(`/standards/content/about-me`);

      await expect($('h1=About Me')).toBeExisting();
  });
});
