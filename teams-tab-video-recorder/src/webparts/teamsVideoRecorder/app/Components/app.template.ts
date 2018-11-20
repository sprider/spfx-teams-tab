import styles from '../../TeamsVideoRecorderWebPart.module.scss';

const template: string = `

<div class="${styles.mediaRecorder}">
        <div class="${styles.container}">
            <div *ngIf="message">
                <div class="${styles.mediaRecorderSection}">
                    {{message}}
                </div>
            </div>
            <div>
                <div class="${styles.mediaRecorderSection}" *ngIf="isLoading">
                    Processing...
                </div>
                <div class="${styles.mediaRecorderSection}" *ngIf="!mediaRecorderApi">
                    This browser does not support the MediaRecorder API.
                </div>
                <div class="${styles.mediaRecorderSection}" *ngIf="mediaRecorderApi">
                    <div></div>
                    <video class="${styles.mediaRecorderVideo}" *ngIf="showVideo" (ngModel)="vdRecorder" autoPlay muted></video>
                    <button class="${styles.mediaRecorderButton}" *ngIf="showCameraSelection" (ngModel)="frontCamera" (click)="cameraChange($event)">Use Back Camera</button>
                    <button class="${styles.mediaRecorderButton}" *ngIf="showStart"  (ngModel)="btnStart" (click)="handleVideoRecording($event)">Start Recording</button>
                    <button class="${styles.mediaRecorderButton}" *ngIf="showStop"  (ngModel)="btnStop" (click)="handleVideoStop($event)">Stop Recording</button>
                    <button class="${styles.mediaRecorderButton}" *ngIf="showUpload" (ngModel)="btnUpload" (click)="handleVideoUpload($event)">Upload Recording</button>
                </div>
            </div>
        </div>
    </div>`;

export default template;