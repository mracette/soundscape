/* 
    Used for local development only (.env.development). Instead of configurating dynamic imports, the following 
    asset index is used. In production (.env.production), assets are fetched from S3.
*/


/* 
    MORNINGS
*/


/* 
    MOONRISE
*/

export const lily = {
    glb: require(`./moonrise/glb/lily.glb`),
    gltf: require(`./moonrise/gltf/lily.gltf`),
    draco: require(`./moonrise/draco/lily-draco.gltf`),
}

export const pineTree = {
    glb: require(`./moonrise/glb/pine-tree.glb`),
    gltf: require(`./moonrise/gltf/pine-tree.gltf`),
    draco: require(`./moonrise/draco/pine-tree-draco.gltf`),
}

export const landscape = {
    glb: require(`./moonrise/glb/landscape.glb`),
    gltf: require(`./moonrise/gltf/landscape.gltf`),
    draco: require(`./moonrise/draco/landscape-draco.gltf`),
}