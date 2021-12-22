import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { DocumentModalComponent } from './document-modal.component';
import { By, PageTestingModule } from '@app/testing';
import { UiKitsModule } from '../../_core/ui-kits/ui-kits.module';
import { noop } from 'rxjs';

describe('DocumentModalComponent', () => {
  let component: DocumentModalComponent;
  let fixture: ComponentFixture<DocumentModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentModalComponent],
      imports: [
        PageTestingModule.withConfig({
          providesConfig: true,
          providesModal: true,
          providesAnalytics: true,
        }),
        IonicModule,
        UiKitsModule,
      ],
    })
      .compileComponents()
      .then(noop);

    fixture = TestBed.createComponent(DocumentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the filter buttons', () => {
    component.currentFilter = ['Billing', 'NewBusiness', 'Endorsement'];
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should dismiss with selected filter', async () => {
    const modalControllerMock = TestBed.inject(ModalController) as any;
    component.currentFilter = ['Billing', 'NewBusiness', 'Endorsement'];
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
    component.onFilterChange({ detail: { value: 'Billing' } });
    const doneButton = fixture.debugElement.query(By.cssAndText('ion-button', 'Done'));
    expect(doneButton).toBeTruthy();
    doneButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(modalControllerMock.dismiss).toHaveBeenCalledWith('Billing');
  });

  it('should navigate to the back page when back button is clicked', () => {
    const backButton = fixture.debugElement.query(By.css('csaa-back-button'));
    expect(backButton).toBeTruthy();
  });

  it('should navigate back to documents page when done is clicked', () => {
    const doneButton = fixture.debugElement.query(By.cssAndText('ion-button', 'Done'));
    expect(doneButton).toBeTruthy();
  });
});
