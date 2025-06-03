import { mount } from '@vue/test-utils'
import RegisterForm from '@/components/RegisterForm.vue'

// Mock del servicio API
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { message: 'Usuario registrado' } }))
  }
}))

describe('RegisterForm.vue', () => {
  it('renderiza todos los campos del formulario', () => {
    const wrapper = mount(RegisterForm)
    expect(wrapper.find('input#firstName').exists()).toBe(true)
    expect(wrapper.find('input#lastName').exists()).toBe(true)
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    expect(wrapper.find('input#address').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('muestra mensaje de éxito tras registro', async () => {
    const wrapper = mount(RegisterForm, {
      global: {
        mocks: {
          $router: { push: vi.fn() }
        }
      }
    })

    // Completa los campos
    await wrapper.find('#firstName').setValue('Juan')
    await wrapper.find('#lastName').setValue('Pérez')
    await wrapper.find('#email').setValue('juan@mail.com')
    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#address').setValue('Calle 123')

    // Envía el formulario
    await wrapper.find('form').trigger('submit.prevent')

    // Espera a que se resuelva la promesa
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Registro exitoso')
  })
})