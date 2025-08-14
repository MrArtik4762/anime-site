const createStyledComponent = (tag) => {
  return function StyledComponent(props) {
    return {
      ...props,
      children: props.children,
      className: props.className || '',
      style: props.style || {},
      'data-testid': props['data-testid']
    };
  };
};

const mockStyled = jest.fn().mockImplementation(createStyledComponent);

// Добавляем поддержку styled.div, styled.button и т.д.
mockStyled.div = createStyledComponent('div');
mockStyled.button = createStyledComponent('button');
mockStyled.header = createStyledComponent('header');
mockStyled.nav = createStyledComponent('nav');
mockStyled.link = createStyledComponent('link');
mockStyled.section = createStyledComponent('section');
mockStyled.input = createStyledComponent('input');
mockStyled.textarea = createStyledComponent('textarea');
mockStyled.span = createStyledComponent('span');

// Добавляем остальные常用的 HTML теги
['a', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'cite', 'code', 'dd', 'details', 'dialog', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'iframe', 'img', 'ins', 'label', 'legend', 'li', 'main', 'mark', 'menu', 'menuitem', 'meter', 'nav', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'select', 'small', 'source', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'u', 'ul', 'var', 'video'].forEach(tag => {
  mockStyled[tag] = createStyledComponent(tag);
});

const createGlobalStyle = jest.fn(() => () => null);

module.exports = {
  __esModule: true,
  default: mockStyled,
  createGlobalStyle: createGlobalStyle,
};