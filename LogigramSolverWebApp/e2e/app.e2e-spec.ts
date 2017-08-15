import { LogigramPage } from './app.po';

describe('logigram App', () => {
  let page: LogigramPage;

  beforeEach(() => {
    page = new LogigramPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
