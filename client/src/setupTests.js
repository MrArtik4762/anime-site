import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  defaultIncludeHidden: false,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock URL
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn(),
};

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock getComputedStyle
window.getComputedStyle = jest.fn().mockReturnValue({
  getPropertyValue: (prop) => {
    return '';
  }
});

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// Restore console.error after tests
afterAll(() => {
  console.error = originalError;
});

// Mock window.alert
window.alert = jest.fn();

// Mock window.confirm
window.confirm = jest.fn(() => true);

// Mock window.prompt
window.prompt = jest.fn(() => '');

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  writable: true,
});

// Mock navigator.languages
Object.defineProperty(navigator, 'languages', {
  value: ['en-US', 'en'],
  writable: true,
});

// Mock performance
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByName: jest.fn(),
  getEntriesByType: jest.fn(),
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => {
  return setTimeout(callback, 0);
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn(clearTimeout);

// Mock Image
global.Image = class MockImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
  set src(value) {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
};

// Mock Blob
global.Blob = jest.fn(() => ({
  size: 1024,
  type: 'application/octet-stream',
}));

// Mock File
global.File = jest.fn((array, name, options) => ({
  name,
  size: array.reduce((acc, val) => acc + val.length, 0),
  type: options?.type || 'application/octet-stream',
  arrayBuffer: async () => new ArrayBuffer(array.reduce((acc, val) => acc + val.length, 0)),
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  fetch.mockClear();
});

// Mock CSS-in-JS libraries
jest.mock('styled-components', () => ({
  // Mock styled components
  default: jest.fn().mockImplementation((tag) => {
    return jest.fn().mockImplementation((props) => {
      return {
        [tag]: {
          style: props,
          className: props.className || '',
        },
      };
    });
  }),
  // Mock css helper
  css: jest.fn(() => (props) => props),
  // Mock keyframes
  keyframes: jest.fn(() => 'mock-keyframes'),
  // Mock injectGlobal
  injectGlobal: jest.fn(),
  // Mock ThemeProvider
  ThemeProvider: ({ children }) => children,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: jest.fn((props) => {
    return {
      ...props,
      children: props.children,
      className: props.className || '',
      style: props.style || {},
    };
  }),
  AnimatePresence: jest.fn(({ children }) => children),
}));

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: true,
    isError: false,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    removeQueries: jest.fn(),
    resetQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClient: jest.fn(() => ({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    queryCache: {
      find: jest.fn(),
    },
    mutationCache: {
      find: jest.fn(),
    },
    removeQueries: jest.fn(),
    resetQueries: jest.fn(),
    cancelQueries: jest.fn(),
    invalidateQueries: jest.fn(),
    refetchQueries: jest.fn(),
    fetchQuery: jest.fn(),
    prefetchQuery: jest.fn(),
    prefetchInfiniteQuery: jest.fn(),
    removeMutation: jest.fn(),
    getQueryData: jest.fn(),
  })),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'test',
  }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  useMatch: () => null,
  useRoutes: () => null,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
  Navigate: ({ to }) => ({ to }),
  Link: ({ to, children }) => children,
  Outlet: () => null,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  Toaster: () => null,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    promise: jest.fn(),
    dismiss: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
}));

// Mock react-player
jest.mock('react-player', () => jest.fn(() => null));

// Mock video.js
jest.mock('video.js', () => ({
  getVideojs: () => jest.fn(),
}));

// Mock dash.js
jest.mock('dashjs', () => ({
  MediaPlayer: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(),
    attachSource: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    isReady: jest.fn(() => true),
    getDuration: jest.fn(() => 100),
    getTime: jest.fn(() => 0),
    seek: jest.fn(),
    setVolume: jest.fn(),
    getVolume: jest.fn(() => 1),
    setMuted: jest.fn(),
    isMuted: jest.fn(() => false),
    setPlaybackRate: jest.fn(),
    getPlaybackRate: jest.fn(() => 1),
    on: jest.fn(),
    off: jest.fn(),
    extend: jest.fn(),
  })),
}));

// Mock hls.js
jest.mock('hls.js', () => ({
  isSupported: () => true,
  Events: {},
  ErrorTypes: {},
  ErrorDetails: {},
  Hls: jest.fn().mockImplementation(() => ({
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    destroy: jest.fn(),
    currentLevel: -1,
    levels: [],
    nextLevel: -1,
    firstLevel: -1,
    autoLevelEnabled: false,
    autoLevelCapping: -1,
    startLevel: -1,
    startLoadPosition: -1,
    loadLevel: jest.fn(),
    loadLevelObject: jest.fn(),
  })),
}));

// Mock plyr
jest.mock('plyr', () => ({
  Plyr: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    restart: jest.fn(),
    stop: jest.fn(),
    togglePlay: jest.fn(),
    forward: jest.fn(),
    rewind: jest.fn(),
    seek: jest.fn(),
    setVolume: jest.fn(),
    increaseVolume: jest.fn(),
    decreaseVolume: jest.fn(),
    toggleMuted: jest.fn(),
    togglePIP: jest.fn(),
    toggleCaptions: jest.fn(),
    isHTML5: jest.fn(() => true),
    isEmbed: jest.fn(() => false),
    supports: jest.fn(() => true),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    destroy: jest.fn(),
    elements: {},
    media: {},
    options: {},
    timers: {},
    debug: {},
    controls: {},
    fullscreen: {},
    captions: {},
    storage: {},
    video: {},
  })),
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

// Mock indexedDB
const indexedDB = {
  open: jest.fn(() => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: jest.fn(),
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          add: jest.fn(),
          get: jest.fn(),
          put: jest.fn(),
          delete: jest.fn(),
          clear: jest.fn(),
          index: jest.fn(() => ({
            get: jest.fn(),
          })),
        })),
      })),
    },
  })),
};
global.indexedDB = indexedDB;

// Export useful test helpers
export const mockLocalStorage = localStorageMock;
export const mockSessionStorage = sessionStorageMock;
export const mockFetch = fetch;