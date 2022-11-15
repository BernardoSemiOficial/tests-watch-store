import { mount } from '@vue/test-utils';
import Search from '@/components/Search';

const mountSearch = () => {
  return mount(Search);
};

describe('Search - unit', () => {
  it('Deve renderizar o componente em tela', () => {
    const wrapper = mountSearch();
    expect(wrapper.exists()).toBeTruthy();
  });

  it('Deve digitar um termo para pesquisar e salvar no estado', () => {
    const wrapper = mountSearch();
    const input = wrapper.findComponent('[data-testid="search-form__input"]');
    const termToSearch = 'Termo para pesquisar';
    input.setValue(termToSearch);
    expect(wrapper.vm.$data.term).toBe(termToSearch);
  });

  it('Deve limpar o campo para pesquisa e emitir um evento de doSearch', async () => {
    const wrapper = mountSearch();
    const input = wrapper.findComponent('[data-testid="search-form__input"]');
    const termToSearch = 'Termo para pesquisar';
    await input.setValue(termToSearch);
    expect(wrapper.vm.$data.term).toBe(termToSearch);
    await input.setValue('');
    expect(wrapper.emitted().doSearch).toBeTruthy();
    expect(wrapper.emitted().doSearch.length).toBe(1);
    expect(wrapper.emitted().doSearch[0]).toEqual([{ term: '' }]);
  });

  it('Deve receber um termo e emitir um evento de doSearch', async () => {
    const wrapper = mountSearch();
    const input = wrapper.findComponent('[data-testid="search-form__input"]');
    const termToSearch = 'Termo para pesquisar';
    await input.setValue(termToSearch);
    await wrapper.trigger('submit');
    expect(input.element.value).toBe(termToSearch);
    expect(wrapper.emitted().doSearch).toBeTruthy();
    expect(wrapper.emitted().doSearch.length).toBe(1);
    expect(wrapper.emitted().doSearch[0]).toEqual([{ term: termToSearch }]);
  });
});
