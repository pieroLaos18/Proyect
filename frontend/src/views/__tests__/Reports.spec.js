import { mount } from '@vue/test-utils'
import Reports from '@/views/Reports.vue'

describe('Reports.vue', () => {
  it('muestra mensaje si no hay datos', () => {
    const wrapper = mount(Reports)
    expect(wrapper.text()).toContain('No hay datos para mostrar.')
  })

  it('muestra la tabla de reportes cuando hay datos', async () => {
    const wrapper = mount(Reports)
    // Simula datos de reporte
    wrapper.vm.reportData = [
      { id: 1, date: '2024-06-03', product: 'Producto 1', quantity: 2, total: 100, usuario: 'Juan' },
      { id: 2, date: '2024-06-04', product: 'Producto 2', quantity: 1, total: 50, usuario: 'Ana' }
    ]
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('tbody tr').length).toBe(2)
    expect(wrapper.text()).toContain('Producto 1')
    expect(wrapper.text()).toContain('Producto 2')
    expect(wrapper.text()).toContain('Juan')
    expect(wrapper.text()).toContain('Ana')
  })
})