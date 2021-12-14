import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import {
  CallbackDataSelection,
  DocumentActionModalComponent,
} from './document-action-modal.component';
import { By, PageTestingModule } from '@app/testing';
import { UiKitsModule } from '../ui-kits.module';
import { delay } from '../../helpers';

describe('DocumentActionModalComponent', () => {
  let component: DocumentActionModalComponent;
  let fixture: ComponentFixture<DocumentActionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule,
        ReactiveFormsModule,
        PageTestingModule.withConfig({
          providesStorage: true,
          providesAnalytics: true,
          providesPlatform: true,
          providesModal: true,
        }),
        UiKitsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentActionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display view document and share document', async () => {
    await delay(50);
    expect(fixture).toMatchSnapshot();
  });

  it('should display document when clicking on view document', () => {
    const modalControllerMock = TestBed.inject(ModalController) as any;
    const viewDocumentButton = fixture.debugElement.query(
      By.cssAndText('ion-item', 'View Document')
    );
    viewDocumentButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(modalControllerMock.dismiss).toHaveBeenCalledWith({
      selection: CallbackDataSelection.view,
    });
  });

  it('should share document when clicking on share document', () => {
    const modalControllerMock = TestBed.inject(ModalController) as any;
    const shareDocumentButton = fixture.debugElement.query(
      By.cssAndText('ion-item', 'Share Document')
    );
    shareDocumentButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(modalControllerMock.dismiss).toHaveBeenCalledWith({
      selection: CallbackDataSelection.share,
    });
  });

  it('should share document when clicking on save document', () => {
    const modalControllerMock = TestBed.inject(ModalController) as any;
    const shareDocumentButton = fixture.debugElement.query(
      By.cssAndText('ion-item', 'Save Document')
    );
    shareDocumentButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(modalControllerMock.dismiss).toHaveBeenCalledWith({
      selection: CallbackDataSelection.save,
    });
  });

  it('should dismiss action modal on close click', async () => {
    await delay(50);
    const closeButton = fixture.debugElement.query(By.cssAndText('ion-button', 'Close'));
    closeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
