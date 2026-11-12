import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrabarPage } from './grabar.page';

describe('GrabarPage', () => {
  let component: GrabarPage;
  let fixture: ComponentFixture<GrabarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GrabarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
