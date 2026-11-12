import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevisarEntradaPage } from './revisar-entrada.page';

describe('RevisarEntradaPage', () => {
  let component: RevisarEntradaPage;
  let fixture: ComponentFixture<RevisarEntradaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisarEntradaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
