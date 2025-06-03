import { mount } from '@vue/test-utils'
import LoginForm from '@/components/LoginForm.vue'

// Mock de axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))
import axios from 'axios'

describe('LoginForm.vue', () => {
  it('renderiza los campos de email y password', () => {
    const wrapper = mount(LoginForm, {
      global: {
        stubs: {
          RouterLink: true
        }
      }
    })
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('muestra error si la autenticación falla', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Credenciales inválidas' } }
    })
    const wrapper = mount(LoginForm, {
      global: {
        mocks: {
          $router: { push: vi.fn() }
        },
        stubs: {
          RouterLink: true
        }
      }
    })
    await wrapper.find('input[type="email"]').setValue('test@mail.com')
    await wrapper.find('input[type="password"]').setValue('wrongpass')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Credenciales inválidas')
  })

  it('redirige según el rol después de login exitoso', async () => {
    const push = vi.fn()
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        user: { id: 1, name: 'Test', email: 'test@mail.com', rol: 'admin' }
      }
    })
    const wrapper = mount(LoginForm, {
      global: {
        mocks: {
          $router: { push }
        },
        stubs: {
          RouterLink: true
        }
      }
    })
    await wrapper.find('input[type="email"]').setValue('test@mail.com')
    await wrapper.find('input[type="password"]').setValue('123456')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(push).toHaveBeenCalledWith('/main/dashboard')
  })
})