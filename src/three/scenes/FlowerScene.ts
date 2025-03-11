import * as THREE from 'three';
import { PetalState } from '../../models/Petal';
import { LetterArrangement } from '../../models/LetterArrangement';

export default class FlowerScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private petals: THREE.Mesh[] = [];
  private connections: THREE.Mesh[] = [];
  private container: HTMLElement;
  private isInitialized: boolean = false;
  
  constructor(container: HTMLElement) {
    this.container = container;
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f8ff);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.z = 15;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Add renderer to container
    container.appendChild(this.renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    this.scene.add(directionalLight);
  }
  
  /**
   * Initialize the flower scene with petals
   */
  public initialize(letterArrangement: LetterArrangement): void {
    if (this.isInitialized) {
      this.clear();
    }
    
    this.createFlowerLayout(letterArrangement);
    this.isInitialized = true;
  }
  
  /**
   * Create the 3D flower layout
   */
  private createFlowerLayout(letterArrangement: LetterArrangement): void {
    // Center petal (Tier 1)
    this.createPetal(
      letterArrangement.center,
      1,
      0,
      new THREE.Vector3(0, 0, 0),
      0xffcc29 // Bright yellow
    );
    
    // Inner ring petals (Tier 2)
    const innerRingRadius = 4.5; // Slightly increased radius
    const innerCount = letterArrangement.innerRing.length;
    
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2;
      const x = innerRingRadius * Math.cos(angle);
      const y = innerRingRadius * Math.sin(angle);
      
      this.createPetal(
        letterArrangement.innerRing[i],
        2,
        i,
        new THREE.Vector3(x, y, 0),
        0x4ecdc4 // Light teal
      );
      
      // Add connection to center
      this.createConnection(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, 0),
        false
      );
      
      // Add connections between adjacent inner petals
      const nextIndex = (i + 1) % innerCount;
      const nextAngle = (nextIndex / innerCount) * Math.PI * 2;
      const nextX = innerRingRadius * Math.cos(nextAngle);
      const nextY = innerRingRadius * Math.sin(nextAngle);
      
      this.createConnection(
        new THREE.Vector3(x, y, 0),
        new THREE.Vector3(nextX, nextY, 0),
        false
      );
    }
    
    // Outer ring petals (Tier 3) - Evenly distributed
    const outerRingRadius = 9.6; // Increased for better spacing (20% increase)
    const outerCount = letterArrangement.outerRing.length;
    
    for (let i = 0; i < outerCount; i++) {
      // Calculate angle for even distribution (30° apart for 12 petals)
      const angle = (i / outerCount) * Math.PI * 2;
      const x = outerRingRadius * Math.cos(angle);
      const y = outerRingRadius * Math.sin(angle);
      
      this.createPetal(
        letterArrangement.outerRing[i],
        3,
        i,
        new THREE.Vector3(x, y, 0),
        0xa893db // Light lavender
      );
      
      // Find the closest inner petal to connect to
      const closestInnerIndex = Math.round((i / outerCount) * innerCount) % innerCount;
      const innerAngle = (closestInnerIndex / innerCount) * Math.PI * 2;
      const innerX = innerRingRadius * Math.cos(innerAngle);
      const innerY = innerRingRadius * Math.sin(innerAngle);
      
      // Add connection to closest inner petal
      this.createConnection(
        new THREE.Vector3(innerX, innerY, 0),
        new THREE.Vector3(x, y, 0),
        false
      );
      
      // Add connections between adjacent outer petals
      const nextIndex = (i + 1) % outerCount;
      const nextAngle = (nextIndex / outerCount) * Math.PI * 2;
      const nextX = outerRingRadius * Math.cos(nextAngle);
      const nextY = outerRingRadius * Math.sin(nextAngle);
      
      this.createConnection(
        new THREE.Vector3(x, y, 0),
        new THREE.Vector3(nextX, nextY, 0),
        false
      );
    }
  }
  
  /**
   * Create a 3D petal
   */
  private createPetal(
    letter: string,
    tier: number,
    index: number,
    position: THREE.Vector3,
    color: number
  ): void {
    // Petal size based on tier - Increased size differential
    const size = tier === 1 ? 1.5 : tier === 2 ? 1.1 : 0.95;
    
    // Create petal geometry - Use hexagon shape instead of sphere
    const geometry = new THREE.CircleGeometry(size, 6);
    
    // Create material with glow effect - Varying intensity by tier
    const material = new THREE.MeshPhongMaterial({
      color: color,
      shininess: 80,
      emissive: color,
      emissiveIntensity: tier === 1 ? 0.4 : tier === 2 ? 0.3 : 0.2
    });
    
    // Create mesh
    const petal = new THREE.Mesh(geometry, material);
    petal.position.copy(position);
    
    // Store metadata as user data
    petal.userData = {
      letter,
      tier,
      index,
      isSelected: false
    };
    
    // Add to scene and store reference
    this.scene.add(petal);
    this.petals.push(petal);
    
    // Add letter text with tier-specific styling
    const textSprite = this.createTextSprite(letter, tier);
    textSprite.position.copy(position);
    textSprite.position.z += size + 0.1;
    this.scene.add(textSprite);
  }
  
  /**
   * Create a simple text sprite for petal letters with tier-specific styling
   */
  private createTextSprite(text: string, tier: number = 1): THREE.Sprite {
    // Create a canvas texture with the letter
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Size and weight vary by tier
    const fontSize = tier === 1 ? 80 : tier === 2 ? 65 : 50;
    const fontWeight = tier === 1 ? 'Bold' : tier === 2 ? 'Bold' : 'Normal';
    
    context.fillStyle = '#000000'; // Black text for all tiers for better readability
    context.font = `${fontWeight} ${fontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 64, 64);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Create sprite material with the texture
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    
    // Create sprite with size based on tier
    const sprite = new THREE.Sprite(material);
    const scale = tier === 1 ? 1.5 : tier === 2 ? 1.3 : 1.1;
    sprite.scale.set(scale, scale, 1);
    
    return sprite;
  }
  
  /**
   * Create a connection between two positions
   */
  private createConnection(
    start: THREE.Vector3,
    end: THREE.Vector3,
    isActive: boolean
  ): void {
    // Calculate direction vector and length
    const direction = end.clone().sub(start);
    const length = direction.length();
    
    // Create cylinder geometry for the connection
    const geometry = new THREE.CylinderGeometry(
      0.08, // radiusTop - thicker lines for better visibility
      0.08, // radiusBottom
      length, // height
      8, // radialSegments
      1, // heightSegments
      false // openEnded
    );
    
    // Rotate and position cylinder to connect points
    geometry.translate(0, length / 2, 0);
    geometry.rotateX(Math.PI / 2);
    
    // Align with direction vector
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );
    
    geometry.applyQuaternion(quaternion);
    
    // Apply position offset
    geometry.translate(start.x, start.y, start.z);
    
    // Create material based on active state
    const material = new THREE.MeshBasicMaterial({
      color: isActive ? 0x3498db : 0xcccccc, // Brighter blue when active
      transparent: true,
      opacity: isActive ? 0.9 : 0.4 // More contrast between active/inactive
    });
    
    // Create mesh
    const connection = new THREE.Mesh(geometry, material);
    
    // Add to scene and store reference
    this.scene.add(connection);
    this.connections.push(connection);
  }
  
  /**
   * Update connection active states
   */
  public updateConnections(selectedPetals: PetalState[]): void {
    // In a real implementation, we would update the materials of connections
    // based on the selected petal path
  }
  
  /**
   * Update petal selected states
   */
  public updatePetalSelection(selectedPetals: PetalState[]): void {
    // In a real implementation, we would update the appearance of petals
    // based on their selection state
  }
  
  /**
   * Handle window resize
   */
  private onWindowResize(): void {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  /**
   * Render the scene
   */
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Animation loop
   */
  public animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    
    // Add any animations here (petal rotation, glow effects, etc.)
    
    this.render();
  }
  
  /**
   * Start the animation loop
   */
  public start(): void {
    this.animate();
  }
  
  /**
   * Clear the scene
   */
  public clear(): void {
    // Remove all petals
    for (const petal of this.petals) {
      this.scene.remove(petal);
    }
    this.petals = [];
    
    // Remove all connections
    for (const connection of this.connections) {
      this.scene.remove(connection);
    }
    this.connections = [];
  }
  
  /**
   * Clean up resources
   */
  public dispose(): void {
    this.clear();
    
    // Remove renderer
    this.container.removeChild(this.renderer.domElement);
    this.renderer.dispose();
    
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
} 