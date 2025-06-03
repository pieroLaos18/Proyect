import { mount } from '@vue/test-utils'
import Users from '@/views/Users.vue'

// Mock de axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn()
  }
}))
import axios from 'axios'

describe('Users.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('userEmail', 'admin@mail.com')
    localStorage.setItem('userRole', 'admin')
    localStorage.setItem('authToken', 'fake-token')
  })

  it('muestra mensaje si no hay usuarios', async () => {
    axios.get.mockResolvedValueOnce({ data: [] })
    const wrapper = mount(Users)
    // Espera a que fetchUsers termine y el DOM se actualice
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No hay usuarios registrados.')
  })

  it('muestra usuarios en la tabla', async () => {
    const users = [
      { id: 1, name: 'Juan', email: 'juan@mail.com', role: 'admin' },
      { id: 2, name: 'Ana', email: 'ana@mail.com', role: 'cajero' }
    ]
    axios.get.mockResolvedValueOnce({ data: users })
    const wrapper = mount(Users)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    // Filtra solo las filas que no contienen el mensaje
    const rows = wrapper.findAll('tbody tr')
    const userRows = rows.filter(row => !row.text().includes('No hay usuarios registrados.'))
    expect(userRows.length).toBe(2)
    expect(wrapper.text()).toContain('Juan')
    expect(wrapper.text()).toContain('Ana')
  })

  it('abre el modal para editar usuario', async () => {
    const users = [
      { id: 1, name: 'Juan', email: 'juan@mail.com', role: 'admin' }
    ]
    axios.get.mockResolvedValueOnce({ data: users })
    const wrapper = mount(Users)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showForm).toBe(false)
    // Simula click en el botón de editar
    await wrapper.find('.btn-ver').trigger('click')
    expect(wrapper.vm.showForm).toBe(true)
    expect(wrapper.find('.modal.user-modal').exists()).toBe(true)
  })
})