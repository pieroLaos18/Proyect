import { mount } from '@vue/test-utils'
import MainView from '@/views/MainView.vue'

// Mock de axios y fetch
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))
global.fetch = vi.fn(() => Promise.resolve({
  json: () => Promise.resolve([])
}))

describe('MainView.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renderiza el nombre de usuario y el sidebar', () => {
    localStorage.setItem('userName', 'Juan')
    localStorage.setItem('userRole', 'admin')
    const wrapper = mount(MainView, {
      global: {
        stubs: {
          'router-link': true,
          'router-view': { template: '<div />' }
        }
      }
    })
    expect(wrapper.text()).toContain('Juan')
    expect(wrapper.find('.sidebar').exists()).toBe(true)
  })

  it('muestra y oculta el sidebar al hacer click en el botón', async () => {
    const wrapper = mount(MainView, {
      global: {
        stubs: {
          'router-link': true,
          'router-view': { template: '<div />' }
        }
      }
    })
    expect(wrapper.vm.isSidebarVisible).toBe(false)
    await wrapper.find('.hamburger-btn').trigger('click')
    expect(wrapper.vm.isSidebarVisible).toBe(true)
    await wrapper.vm.closeSidebar()
    expect(wrapper.vm.isSidebarVisible).toBe(false)
  })

  it('cambia el tema al hacer click en el icono', async () => {
    const wrapper = mount(MainView, {
      global: {
        stubs: {
          'router-link': true,
          'router-view': { template: '<div />' }
        }
      }
    })
    expect(wrapper.vm.theme).toBe('light')
    await wrapper.find('.theme-toggle i').trigger('click')
    expect(wrapper.vm.theme).toBe('dark')
  })

  it('abre el modal de notificaciones de bajo stock', async () => {
    const wrapper = mount(MainView, {
      global: {
        stubs: {
          'router-link': true,
          'router-view': { template: '<div />' }
        }
      }
    })
    await wrapper.vm.openNotifications()
    expect(wrapper.vm.showNotifications).toBe(true)
  })
})