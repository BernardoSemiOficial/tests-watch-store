import { createLocalVue, mount } from '@vue/test-utils';
import { makeServer } from '@/miragejs/server';
import Cart from '@/components/Cart.vue';
import { CartManager } from '@/managers/CartManager';

const manager = new CartManager();

describe('Cart - unit', () => {
  let server;

  const getProducts = (quantity, restProducts) => {
    const products = [
      ...server.createList('product', quantity),
      ...restProducts.map((product) => server.create('product', product)),
    ];
    return products;
  };

  const mountCart = (quantity = 10, restProducts = [], options = {}) => {
    const products = getProducts(quantity, restProducts);

    const wrapper = mount(Cart, {
      propsData: {
        isOpen: false,
      },
      mocks: {
        $cart: manager,
      },
      ...options,
    });

    return { wrapper, products, manager };
  };

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('Deve renderizar o componente', () => {
    const { wrapper } = mountCart();
    expect(wrapper.exists()).toBeTruthy();
  });

  it('Deve estar escondido o carrinho inicialmente', () => {
    const { wrapper } = mountCart();
    expect(wrapper.vm.$props.isOpen).toBe(false);
    expect(wrapper.classes()).toContain('hidden');
  });

  it('Deve aparecer o carrinho quando isOpen = true', () => {
    const { wrapper } = mountCart(10, [], {
      propsData: {
        isOpen: true,
      },
    });
    expect(wrapper.vm.$props.isOpen).toBe(true);
    expect(wrapper.classes()).not.toContain('hidden');
  });

  it('Deve fechar o carrinho ao clicar no botão', async () => {
    const { wrapper } = mountCart();

    const state = wrapper.vm.$cart.open();
    const buttonCloseCart = wrapper.find('[data-testid="cart-button-close"]');
    await buttonCloseCart.trigger('click');

    expect(state.open).toBe(false);
  });

  it('Deve aparecer a mensagem de carrinho vazio quando não tiver produtos', () => {
    const { wrapper } = mountCart(10, [], {
      propsData: {
        isOpen: false,
        products: [],
      },
    });
    const cartItems = wrapper.vm.$props.products;
    const cartItemsElement = wrapper.findAll('[data-testid="cart-item"]');
    const feedback = wrapper.find('[data-testid="cart-is-empty"]');

    expect(cartItems.length).toBe(0);
    expect(cartItemsElement.length).toBe(0);
    expect(feedback.exists()).toBeTruthy();
    expect(feedback.isVisible()).toBeTruthy();
    expect(feedback.text()).toBe('Cart is empty');
  });

  it('Deve prover e exibir dois produtos de CartItem', async () => {
    const { wrapper, products } = mountCart(2);
    wrapper.vm.$cart.addProduct(products[0]);
    const state = wrapper.vm.$cart.addProduct(products[1]);
    await wrapper.setProps({
      products: state.items,
    });
    const cartItems = wrapper.vm.$props.products;
    const cartItemsElement = wrapper.findAll('[data-testid="cart-item"]');

    expect(cartItems.length).toBe(2);
    expect(cartItemsElement.length).toBe(2);
    expect(wrapper.text()).not.toContain('Cart is empty');
  });

  it('Deve exibir o botão clear cart', () => {
    const { wrapper } = mountCart();
    const button = wrapper.find('[data-testid="clear-cart"]');
    expect(button.exists()).toBeTruthy();
  });

  it('Deve chamar o cart manager clearCart() ao clicar no botão clear cart', async () => {
    const { wrapper, manager } = mountCart();
    const spy = jest.spyOn(manager, 'clearCart');
    await wrapper.find('[data-testid="clear-cart"]').trigger('click');
    expect(spy).toBeCalledTimes(1);
  });
});
