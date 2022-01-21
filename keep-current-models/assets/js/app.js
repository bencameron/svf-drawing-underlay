let divId = "MyViewerDiv";
let viewer;
let container;
let sceneBuilder;
let modelBuilder;

async function setupViewer() {
    let options = {
        env: 'AutodeskProduction2',
        api: 'streamingV2',
        getAccessToken: tokenFactory
    };
       
    await new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer(options, function () {
            container = document.getElementById(divId);
            viewer = new Autodesk.Viewing.GuiViewer3D(container);        
            viewer.start();
            
            resolve();
        });
    });

    await viewer.loadExtension('Autodesk.Viewing.SceneBuilder');
    sceneBuilder = viewer.getExtension('Autodesk.Viewing.SceneBuilder');

    // Create a dummy model first that conserves memory, so that we can avoid the "Model is empty" dialog
    //  This is a workaround provided by Denis Gregor in 5/27/20 email for a bug in the viewer
    await sceneBuilder.addNewModel({ conserveMemory: true });
    modelBuilder = await sceneBuilder.addNewModel({});

    await addSvf(testUrn);
   
    resetView();
}

async function addSvf(documentId) {
    return new Promise((resolve, reject) => {
        let onDocumentLoadSuccess = (doc) => {
            var viewables = doc.getRoot().getDefaultGeometry();

            let opt = {
                globalOffset:{x:0,y:0,z:0},
                preserveView: true,
                keepCurrentModels: true
            }

            viewer.loadDocumentNode(doc, viewables, opt).then(i => {
                resolve()
            });
        }

        let onDocumentLoadFailure = (viewerErrorCode) => {
            console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
            reject()
        }

        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    })
}

function resetView() {
    resetCamera();

    viewer.addEventListener(Autodesk.Viewing.CAMERA_TRANSITION_COMPLETED, setHomeView);
    viewer.fitToView();

    function setHomeView() {
        viewer.impl['controls'].recordHomeView();
        viewer.removeEventListener(Autodesk.Viewing.CAMERA_TRANSITION_COMPLETED, setHomeView);
    }
}

function resetCamera() {
    const camera = viewer.getCameraFromViewArray([
        1, 1, 1,
        0, 0, 0,
        0, 1, 0,
        this.getAspect(),
        50 * Math.PI / 180,
        60,
        1
    ]);

    viewer.impl.setViewFromCamera(camera, true, true);
}

function getAspect() {
    return container.clientWidth / container.clientHeight;
}
