import { mount } from '@vue/test-utils'
import Products from '@/views/Products.vue'

// Mock de axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))
import axios from 'axios'

describe('Products.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const globalConfig = {
    stubs: {
      'router-link': true
    },
    mocks: {
      $route: { query: {} }
    }
  }

  it('muestra mensaje si no hay productos', async () => {
    axios.get.mockResolvedValueOnce({ data: [] })
    const wrapper = mount(Products, { global: globalConfig })
    await wrapper.vm.fetchProducts()
    wrapper.vm.loading = false
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No hay productos para mostrar.')
  })

  it('muestra productos en la vista de tarjetas', async () => {
    const productos = [
      { id: 1, name: 'Producto 1', description: 'Desc 1', price: 10, category: 'A', stock: 5, image: '', low_stock: false, stock_min: 1, stock_max: 10 },
      { id: 2, name: 'Producto 2', description: 'Desc 2', price: 20, category: 'B', stock: 2, image: '', low_stock: true, stock_min: 1, stock_max: 10 }
    ]
    axios.get.mockResolvedValueOnce({ data: productos })
    const wrapper = mount(Products, { global: globalConfig })
    await wrapper.vm.fetchProducts()
    wrapper.vm.loading = false
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.product-card').length).toBe(2)
    expect(wrapper.text()).toContain('Producto 1')
    expect(wrapper.text()).toContain('Producto 2')
  })

  it('abre el modal para agregar producto', async () => {
    axios.get.mockResolvedValueOnce({ data: [] })
    const wrapper = mount(Products, { global: globalConfig })
    await wrapper.vm.fetchProducts()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showProductModal).toBe(false)
    await wrapper.find('.btn-primary').trigger('click')
    expect(wrapper.vm.showProductModal).toBe(true)
  })
})