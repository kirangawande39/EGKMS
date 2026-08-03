const Hierarchy = require("./hierarchy.model");


// Create Hierarchy
const createHierarchy = async (data) => {

    const hierarchy = await Hierarchy.create(data);

    return hierarchy;

};


// Get All Hierarchy
const getAllHierarchy = async () => {

    const hierarchy = await Hierarchy.find()
        .populate("parentId", "name level")
        .populate("createdBy", "name email");

    return hierarchy;

};


// Get Single Hierarchy

const getHierarchyById = async (id) => {

    const hierarchy = await Hierarchy.findById(id)
        .populate("parentId", "name level");


    return hierarchy;

};


// Update Hierarchy

const updateHierarchy = async(id,data)=>{

    const hierarchy = await Hierarchy.findByIdAndUpdate(
        id,
        data,
        {
            new:true,
            runValidators:true
        }
    );


    return hierarchy;

};


// Delete Hierarchy

const deleteHierarchy = async(id)=>{

    const hierarchy = await Hierarchy.findByIdAndDelete(id);

    return hierarchy;

};


module.exports = {
    createHierarchy,
    getAllHierarchy,
    getHierarchyById,
    updateHierarchy,
    deleteHierarchy
};