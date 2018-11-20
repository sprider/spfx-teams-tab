import { Component, Input, OnInit, Inject } from '@angular/core';
import styles from '../../TeamsVideoRecorderWebPart.module.scss';
import { IFile } from './IFile';
import { AppService } from './app.service';
import AppTemplate from './app.template';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { MSGraphClient } from '@microsoft/sp-http';

@Component({
    selector: 'app-root',
    template: AppTemplate,
    providers: [AppService]
})
export class AppComponent implements OnInit {

    public context: WebPartContext;
    public teamscontext: microsoftTeams.Context;
    public file: IFile;
    public fileBlob: any = null;
    public currentStream: any = null;
    public recordedBlobs: any = [];
    public recordedBlobType: any = null;
    public message: string = null;
    public vdRecorderSrc: string = null;
    public graphClient: MSGraphClient = null;
    public isLoading: boolean = true;
    public frontCamera: boolean = true;
    public mediaRecorderApi: boolean = false;
    public showVideo: boolean = true;
    public showStart: boolean = true;
    public showStop: boolean = false;
    public showUpload: boolean = false;
    public showCameraSelection: boolean = true;

    constructor(@Inject(AppService) private appservice) {
    }

    public ngOnInit() {
        
        this.isLoading = true;
        this.context = window["context"];
        this.teamscontext = window["teamscontext"];

        this.file = null;
        this.fileBlob = null;
        this.currentStream = null;
        this.recordedBlobs = [];
        this.recordedBlobType = null;

        this.message = null;
        this.vdRecorderSrc = null;
        this.graphClient = null;

        this.frontCamera = true;
        this.mediaRecorderApi = false;
        this.showVideo = true;
        this.showStart = true;
        this.showStop = false;
        this.showUpload = false;
        this.showCameraSelection = true;
        
        if ((window as any).MediaRecorder) {
            this.mediaRecorderApi = true;
        } else {
            this.mediaRecorderApi = false;
        }

        if (this.teamscontext) {
            
            this.context.msGraphClientFactory
                .getClient()
                .then((client: MSGraphClient): void => {
                    this.graphClient = client;
                });
        }
        else {
            this.message = "Please try this add-in in teams tab as an app."; 
        }

        this.isLoading = false;
    }

    private handleVideoRecording(event?: any): void {

        try {
            // First get ahold of getUserMedia, if present
            // Return if browser does not implement to keep a consistent interface
            if (navigator.mediaDevices.getUserMedia === undefined) {
                this.message = "This browser does not support the MediaRecorder API.";
                return;
            }

            let videoZoneElement = event.srcElement.parentElement;
            let vdRecorder = videoZoneElement.querySelector('video');

            let constraints = {
                audio: true,
                video: {
                    frameRate: { ideal: 10, max: 15 },
                    facingMode: (this.frontCamera ? "user" : "environment")
                }
            };

            let currentcontext = this;

            navigator.mediaDevices.getUserMedia(constraints)
                .then(function (stream) {
                    currentcontext.vdRecorderSrc = window.URL.createObjectURL(stream);
                    vdRecorder.src = currentcontext.vdRecorderSrc;
                    let mediaRecorder = new (window as any).MediaRecorder(stream);
                    currentcontext.currentStream = null;
                    currentcontext.recordedBlobs = [];
                    currentcontext.currentStream = stream;
                    mediaRecorder.start(10);
                    mediaRecorder.ondataavailable = function (e) {
                        if (e.data && e.data.size > 0) {
                            currentcontext.recordedBlobs.push(e.data);
                        }
                    };

                }).catch(function (err) {
                    this.message = "The camera recording request failed";
                    console.error(err);
                });
            this.showStart = false;
            this.showStop = true;
            this.showUpload = false;
            this.showCameraSelection = false;
        }
        catch (err) {
            this.message = "The camera recording request failed";
            console.error(err);
        }
    }

    private handleVideoStop(event?: any): void {

        try {
            this.currentStream.getTracks().forEach(function (track) {
                track.stop();
            });

            this.recordedBlobType = this.recordedBlobs[0].type;
            this.fileBlob = new Blob(this.recordedBlobs, { type: this.recordedBlobType });

            let videoZoneElement = event.srcElement.parentElement;
            if (videoZoneElement) {

                let vdRecorder = videoZoneElement.querySelector('video');
                if (vdRecorder) {

                    if (vdRecorder) {
                        vdRecorder.pause();
                        vdRecorder.src = '';
                        vdRecorder.load();
                    }

                    if (this.currentStream && this.currentStream.stop) {
                        this.currentStream.stop();
                    }
                }

                let videoPlaybackZoneElement = videoZoneElement.querySelector('div');
                if (videoPlaybackZoneElement) {
                    let videoPlaybackElement = document.createElement('video');
                    videoPlaybackElement.controls = true;
                    videoPlaybackElement.classList.add(styles.mediaRecorderVideo);
                    videoPlaybackElement.src = window.URL.createObjectURL(this.fileBlob);
                    videoPlaybackZoneElement.appendChild(videoPlaybackElement);
                    videoPlaybackElement.play();
                }
            }
        }
        catch (err) {
            this.message = "The camera stop request failed";
            console.error(err);
        }
        finally {
            this.currentStream = null;
            this.recordedBlobs = [];
            this.recordedBlobType = null;
            this.vdRecorderSrc = null;
            this.showVideo = false;
            this.showStart = false;
            this.showStop = false;
            this.showUpload = true;
        }
    }
    
    private cameraChange(event?: any): void {

        try {
            if (event.srcElement) {
                if (event.srcElement.innerText == "Use Front Camera") {
                    event.srcElement.innerText = "Use Back Camera";
                    this.frontCamera = true;

                } else {
                    event.srcElement.innerText = "Use Front Camera";
                    this.frontCamera = false;
                }
            }
        }
        catch (err) {
            this.message = "The camera change request failed";
            console.error(err);
        }
    }

    private handleVideoUpload(event?: any): void {

        this.showUpload = false;
        this.isLoading = true;

        try {
            let rand = Math.floor((Math.random() * 10000000));
            let fileName = "video_" + rand + ".webm";

            this.appservice.uploadFile(this.graphClient, this.fileBlob, fileName).then((response: any): void => {
                this.message =  "File uploaded with name " + fileName + " in your OneDrive root folder.";
                console.log(response);
            }).catch((err): void => {
                this.message =  "The video upload request failed";
                console.error(err);
            });

            let videoZoneElement = event.srcElement.parentElement;

            if (videoZoneElement) {
                let videoPlaybackZoneElement = videoZoneElement.querySelector('div');

                if (videoPlaybackZoneElement) {
                    let videoPlaybackElement = videoZoneElement.querySelector('video');

                    if (videoPlaybackElement) {
                        videoPlaybackElement.parentNode.removeChild(videoPlaybackElement);
                    }
                }
            }
        }
        catch (err) {
            this.message = "The video upload request failed";
            console.error(err);
        }
        finally {
            this.fileBlob = null;
            this.isLoading = false;
        }
    }
    
    public handleVideoRetry(event?: any): void {

        try {

            let videoZoneElement = event.srcElement.parentElement;
            if (videoZoneElement) {

                let videoPlaybackZoneElement = videoZoneElement.querySelector('div');
                if (videoPlaybackZoneElement) {

                    let videoPlaybackElement = videoZoneElement.querySelector('video');
                    if (videoPlaybackElement) {
                        videoPlaybackElement.parentNode.removeChild(videoPlaybackElement);
                    }
                }
            }

            this.ngOnInit();
        }
        catch (err) {
            this.message = "The retry request failed";
            console.error(err);
        }
    }
}  