import { mount } from '@vue/test-utils'
import Sales from '@/views/Sales.vue'

// Mock de los servicios
vi.mock('@/services/sales', () => ({
  default: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    getById: vi.fn(),
    create: vi.fn(),
    anular: vi.fn()
  }
}))
vi.mock('@/services/products', () => ({
  default: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    update: vi.fn()
  }
}))

import salesService from '@/services/sales'
import productsService from '@/services/products'

describe('Sales.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra mensaje si no hay ventas', async () => {
    salesService.getAll.mockResolvedValueOnce({ data: [] })
    productsService.getAll.mockResolvedValueOnce({ data: [] })
    const wrapper = mount(Sales)
    await wrapper.vm.fetchVentas()
    await wrapper.vm.fetchProductos()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No hay ventas registradas.')
  })

  it('muestra ventas en la tabla', async () => {
    const ventas = [
      { id: 1, fecha: '2024-06-03', cliente: 'Juan', total: 100, productos: [{ name: 'Prod 1', cantidad: 1, precio: 100 }], anulada: false },
      { id: 2, fecha: '2024-06-04', cliente: 'Ana', total: 50, productos: [{ name: 'Prod 2', cantidad: 2, precio: 25 }], anulada: false }
    ]
    salesService.getAll.mockResolvedValueOnce({ data: ventas })
    productsService.getAll.mockResolvedValueOnce({ data: [] })
    const wrapper = mount(Sales)
    // Espera a que el ciclo de vida termine
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    // Asegura que no hay filtro de búsqueda
    wrapper.vm.busqueda = ''
    await wrapper.vm.$nextTick()
    // Filtra solo las filas que no contienen el mensaje
    const rows = wrapper.findAll('tbody tr')
    const ventaRows = rows.filter(row => !row.text().includes('No hay ventas registradas.'))
    if (ventaRows.length !== 2) {
      console.log(wrapper.html())
    }
    expect(ventaRows.length).toBe(2)
    expect(wrapper.text()).toContain('Juan')
    expect(wrapper.text()).toContain('Ana')
  })

  it('abre el modal para registrar nueva venta', async () => {
    salesService.getAll.mockResolvedValueOnce({ data: [] })
    productsService.getAll.mockResolvedValueOnce({ data: [] })
    const wrapper = mount(Sales)
    await wrapper.vm.fetchVentas()
    await wrapper.vm.fetchProductos()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.modalNuevaVenta).toBe(false)
    await wrapper.find('.btn-primary').trigger('click')
    expect(wrapper.vm.modalNuevaVenta).toBe(true)
  })
})