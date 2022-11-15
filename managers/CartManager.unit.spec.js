import { CartManager } from './CartManager';
import { makeServer } from '~/miragejs/server';

describe('CartManager', () => {
  let server;
  let manager;

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
    manager = new CartManager();
  });

  afterEach(() => {
    server.shutdown();
  });

  it('Deve retornar o state inicial do cart', () => {
    const state = manager.getState();
    expect(state).toEqual({
      open: false,
      items: [],
    });
  });

  it('Deve retornar o state mais atual do cart', () => {
    const product = server.create('product');
    manager.open();
    manager.addProduct(product);
    const state = manager.getState();
    expect(state).toEqual({
      open: true,
      items: [product],
    });
  });

  it('Deve mudar o cart para open', () => {
    const state = manager.open();
    expect(state.open).toBe(true);
  });

  it('Deve mudar o cart para closed', () => {
    const state = manager.close();
    expect(state.open).toBe(false);
  });

  it('Deve adicionar o produto ao carrinho somente uma vez', () => {
    const product = server.create('product');
    manager.addProduct(product);
    const state = manager.addProduct(product);
    expect(state.items).toHaveLength(1);
  });

  it('Deve remover o produto do carrinho', () => {
    const product = server.create('product');

    const stateAdd = manager.addProduct(product);
    expect(stateAdd.items).toHaveLength(1);

    const stateRem = manager.removeProduct(product.id);
    expect(stateRem.items).toHaveLength(0);
  });

  it('Deve remover todos os produtos do carrinho', () => {
    const product1 = server.create('product');
    const product2 = server.create('product');
    manager.addProduct(product1);
    manager.addProduct(product2);
    const state = manager.removeAllProducts();
    expect(state.items).toHaveLength(0);
  });

  it('Deve limpar o carrinho', () => {
    const product1 = server.create('product');
    const product2 = server.create('product');
    manager.addProduct(product1);
    manager.addProduct(product2);
    const state = manager.clearCart();
    expect(state.items).toHaveLength(0);
    expect(state.open).toBe(false);
  });

  it('Deve retornar true se o carrinho se não estiver vazio', () => {
    const product = server.create('product');
    manager.addProduct(product);
    expect(manager.hasProducts()).toBe(true);
  });

  it('Deve retornar true se o produto já estiver no carrinho', () => {
    const product = server.create('product');
    manager.addProduct(product);
    expect(manager.productIsInTheCart(product)).toBe(true);
  });
});
