import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('renderiza el router-view', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'router-view': { template: '<div class="router-view-stub"/>' }
        }
      }
    })
    expect(wrapper.find('.router-view-stub').exists()).toBe(true)
  })

  it('detecta autenticación correctamente', () => {
    localStorage.setItem('authToken', 'fake-token')
    const wrapper = mount(App, {
      global: {
        stubs: { 'router-view': true }
      }
    })
    expect(wrapper.vm.isAuthenticated).toBe(true)
  })

  it('cambia el tema y lo guarda en localStorage', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: { 'router-view': true }
      }
    })
    wrapper.vm.setTheme('dark')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})