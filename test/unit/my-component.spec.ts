import {StageComponent} from 'aurelia-testing';
import {bootstrap} from 'aurelia-bootstrapper';
import {PLATFORM} from 'aurelia-pal';

describe('MyComponent', () => {
  let component;

  beforeEach(() => {
    component = StageComponent
      .withResources(PLATFORM.moduleName('my-component.html') && PLATFORM.moduleName('my-component'))
      .inView('<my-component first-name.bind="firstName"></my-component>')
      .boundTo({ firstName: 'Bob' });
  });

  it('should render first name', done => {
    component.create(bootstrap).then(() => {
      const nameElement = document.querySelector('.firstName');
      expect(nameElement.innerHTML).toBe('Bob');
      done();
    }).catch(e => { console.log(e.toString()) });
  });

  afterEach(() => {
    component.dispose();
  });
});
