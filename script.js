// Basic setup for Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create the WebGL renderer and set the pixel ratio for better quality
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio); // Set pixel ratio for better clarity
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add directional light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(50, 50, 50).normalize();
scene.add(light);

// Add ambient light for softer illumination
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

// Add OrbitControls for mouse control over the camera
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Define color scale for bars (yellow to red)
const colorScale = d3.scaleSequential(d3.interpolateYlOrRd);

// Load data from CSV
d3.csv('MatrixForIPFforVis.csv').then(function(data) {
    // Get min and max values for scaling heights and colors
    console.log(data, 'dataa');
    const values = data.map(row => Object.values(row).map(Number)); // Convert to array of arrays of numbers
    console.log(values, 'values');
    const flatValues = values.flat(); // Flatten the array
    console.log(flatValues);
    const minValue = d3.min(flatValues);
    const maxValue = d3.max(flatValues);

    console.log(data, 'data');

    // Calculate grid size to accommodate data
    const numRows = data.length; // Number of rows (AIV-Reps)
    const numCols = Object.keys(data[0]).length; // Number of columns (AIV-SubMecs)
    const gridSize = Math.max(numRows, numCols);
    const barSpacing = 1.5; // Spacing between the bars

    // Create a white base plane
    const baseGeometry = new THREE.PlaneGeometry(numCols * barSpacing, numRows * barSpacing);
    const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black base

    const basePlane = new THREE.Mesh(baseGeometry, baseMaterial);
    basePlane.rotation.x = -Math.PI / 2; // Rotate the plane to lie flat
    basePlane.position.y = 0; // Position it at y=0
    scene.add(basePlane); // Add the base plane to the scene
    scene.background = new THREE.Color(0xffffff); // White background

    // Create 3D bars based on the CSV dataset
    values.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            if (value > 0) { // Only create bars for non-zero values
                const height = (value - minValue) / (maxValue - minValue) * 10; // Normalize height

                // Create geometry for each bar
                const geometry = new THREE.BoxGeometry(1, height, 1); // Slightly increase size for better visibility
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(colorScale((value - minValue) / (maxValue - minValue))),
                    roughness: 0.5, // Adjust roughness for better material quality
                    metalness: 0.5 // Add some metallic effect
                });

                const bar = new THREE.Mesh(geometry, material);

                // Position the bars in a grid with proper spacing
                const x = colIndex * barSpacing - (numCols * barSpacing) / 2; // X position
                const z = rowIndex * barSpacing - (numRows * barSpacing) / 2; // Z position
                bar.position.set(x, height / 2, z); // Set the height so the bar is on the base

                scene.add(bar);
            }
        });
    });

    // Set initial camera position
    camera.position.set(115, 45, 55); // Adjust Z position
    controls.update();

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resizing
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
