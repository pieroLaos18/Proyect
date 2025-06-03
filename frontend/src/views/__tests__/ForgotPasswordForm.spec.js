import { mount } from '@vue/test-utils'
import ForgotPasswordForm from '@/components/ForgotPasswordForm.vue'

// Mock de axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))
import axios from 'axios'

describe('ForgotPasswordForm.vue', () => {
  it('renderiza el campo de email y el botón', () => {
    const wrapper = mount(ForgotPasswordForm, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('muestra mensaje de éxito tras enviar el correo', async () => {
    axios.post.mockResolvedValueOnce({})
    const wrapper = mount(ForgotPasswordForm, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    await wrapper.find('input[type="email"]').setValue('test@mail.com')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Revisa tu correo para restablecer tu contraseña.')
  })

  it('muestra mensaje de error si falla el envío', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Correo no registrado' } }
    })
    const wrapper = mount(ForgotPasswordForm, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    await wrapper.find('input[type="email"]').setValue('fail@mail.com')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Correo no registrado')
  })
})