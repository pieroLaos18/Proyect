import { mount } from '@vue/test-utils'
import Dashboard from '@/views/Dashboard.vue'

// Mock de axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}))
import axios from 'axios'

// Stub para los componentes de gráficos
const PieStub = { template: '<div class="pie-stub"></div>' }
const BarStub = { template: '<div class="bar-stub"></div>' }

describe('Dashboard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza resumen de ventas, usuarios, productos destacados y actividades', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { hoy: 5, mes: 20 } }) // resumenVentas
      .mockResolvedValueOnce({ data: { activos: 3 } }) // resumenUsuarios
      .mockResolvedValueOnce({ data: [
        { id: 1, name: 'Producto 1', vendidos: 10, stock: 5 }
      ] }) // productosDestacados
      .mockResolvedValueOnce({ data: [
        { id: 1, fecha: '2024-06-03', descripcion: 'Actividad 1' }
      ] }) // ultimasActividades
      .mockResolvedValueOnce({ data: [
        { dia: 'Lunes', total: 5 }
      ] }) // ventasPorDia
      .mockResolvedValueOnce({ data: [
        { dia: 'Lunes', total: 3 }
      ] }) // ventasPorDiaAnterior
      .mockResolvedValueOnce({ data: [
        { metodo_pago: 'Efectivo', total: 10 }
      ] }) // metodosPago
    const wrapper = mount(Dashboard, {
      global: {
        stubs: {
          Pie: PieStub,
          Bar: BarStub,
          RouterLink: true
        }
      }
    })
    // Espera a que se resuelvan todas las promesas y se actualice el DOM
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    // Resumen ventas y usuarios
    expect(wrapper.text()).toContain('Ventas Hoy')
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('Ventas Mes')
    expect(wrapper.text()).toContain('20')
    expect(wrapper.text()).toContain('Usuarios Activos')
    expect(wrapper.text()).toContain('3')

    // Productos destacados
    expect(wrapper.text()).toContain('Producto 1')
    expect(wrapper.text()).toContain('10 vendidos')
    expect(wrapper.text()).toContain('Stock: 5')

    // Últimas actividades
    expect(wrapper.text()).toContain('Actividad 1')
  })

  it('muestra mensaje si no hay métodos de pago', async () => {
    axios.get.mockResolvedValue({ data: [] }) // Para todos los gets
    const wrapper = mount(Dashboard, {
      global: {
        stubs: {
          Pie: PieStub,
          Bar: BarStub,
          RouterLink: true
        }
      }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No hay datos de métodos de pago.')
  })
})