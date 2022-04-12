import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeedGameComponent } from './speed-game.component';

describe('SpeedGameComponent', () => {
  let component: SpeedGameComponent;
  let fixture: ComponentFixture<SpeedGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeedGameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeedGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
