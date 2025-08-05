// Route configuration for the application
export const ROUTES = {
  HOME: 'home',
  EDITOR: 'editor',
  CODE_MANAGER: 'code-manager',
  CODE_TREASURE: 'code-treasure'
}

// Route definitions with metadata
export const ROUTE_CONFIG = {
  [ROUTES.HOME]: {
    path: '/',
    name: 'Home',
    component: 'HomePage',
    icon: 'home',
    description: 'Welcome to AI Code Studio Pro'
  },
  [ROUTES.EDITOR]: {
    path: '/editor',
    name: 'Code Editor',
    component: 'CodeEditor',
    icon: 'code',
    description: 'AI-powered code editor with Gemini integration'
  },
  [ROUTES.CODE_MANAGER]: {
    path: '/code-manager',
    name: 'Code Manager',
    component: 'CodeManagerPage',
    icon: 'folder',
    description: 'Manage and organize your code snippets'
  },
  [ROUTES.CODE_TREASURE]: {
    path: '/code-treasure',
    name: 'Code Treasure',
    component: 'CodeTreasure',
    icon: 'treasure',
    description: 'Discover and explore code treasures'
  }
}

// Navigation menu items
export const NAVIGATION_ITEMS = [
  {
    id: ROUTES.HOME,
    name: 'Home',
    icon: 'home',
    description: 'Welcome page'
  },
  {
    id: ROUTES.EDITOR,
    name: 'Editor',
    icon: 'code',
    description: 'Code editor'
  },
  {
    id: ROUTES.CODE_MANAGER,
    name: 'Code Manager',
    icon: 'folder',
    description: 'Manage snippets'
  },
  {
    id: ROUTES.CODE_TREASURE,
    name: 'Code Treasure',
    icon: 'treasure',
    description: 'Explore treasures'
  }
]

// Helper function to get route by path
export const getRouteByPath = (path) => {
  return Object.values(ROUTE_CONFIG).find(route => route.path === path)
}

// Helper function to get route by id
export const getRouteById = (id) => {
  return ROUTE_CONFIG[id]
} 