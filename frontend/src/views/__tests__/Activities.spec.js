import { mount } from '@vue/test-utils'
import Activities from '@/views/Activities.vue'

// Mock de axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}))
import axios from 'axios'

describe('Activities.vue', () => {
  it('muestra mensaje si no hay actividades', async () => {
    axios.get.mockResolvedValueOnce({ data: [] })
    const wrapper = mount(Activities)
    // Espera a que se resuelva la petición y se actualice el DOM
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No hay actividades registradas.')
  })

  it('muestra actividades en la tabla', async () => {
    const actividades = [
      { id: 1, fecha: '2024-06-03T10:00:00Z', descripcion: 'Actividad 1' },
      { id: 2, fecha: '2024-06-03T12:00:00Z', descripcion: 'Actividad 2' }
    ]
    axios.get.mockResolvedValueOnce({ data: actividades })
    const wrapper = mount(Activities)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('tbody tr').length).toBe(2)
    expect(wrapper.text()).toContain('Actividad 1')
    expect(wrapper.text()).toContain('Actividad 2')
  })
})