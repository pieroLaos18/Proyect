import { mount } from '@vue/test-utils'
import ResetPasswordForm from '@/components/ResetPasswordForm.vue'

// Mock de axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))
import axios from 'axios'

describe('ResetPasswordForm.vue', () => {
  const $route = { params: { token: 'fake-token' } }
  const $router = { push: vi.fn() }

  it('renderiza el campo de nueva contraseña', () => {
    const wrapper = mount(ResetPasswordForm, {
      global: {
        mocks: { $route, $router }
      }
    })
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('muestra mensaje de éxito tras restablecer', async () => {
    axios.post.mockResolvedValueOnce({})
    const wrapper = mount(ResetPasswordForm, {
      global: {
        mocks: { $route, $router }
      }
    })
    await wrapper.find('input[type="password"]').setValue('nuevaClave123')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('¡Contraseña restablecida! Ahora puedes iniciar sesión.')
  })

  it('muestra mensaje de error si falla el restablecimiento', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Token inválido' } }
    })
    const wrapper = mount(ResetPasswordForm, {
      global: {
        mocks: { $route, $router }
      }
    })
    await wrapper.find('input[type="password"]').setValue('nuevaClave123')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Token inválido')
  })

  it('redirige al login al hacer click en el botón', async () => {
    const wrapper = mount(ResetPasswordForm, {
      global: {
        mocks: { $route, $router }
      }
    })
    await wrapper.find('.login-link').trigger('click')
    expect($router.push).toHaveBeenCalledWith('/login')
  })
})