const hierarchyService = require("./hierarchy.service");

// Create
exports.createHierarchy = async(req,res,next)=>{

    try{

        const hierarchy = await hierarchyService.createHierarchy({
            ...req.body,
            createdBy:req.user.id
        });


        res.status(201).json({
            success:true,
            message:"Hierarchy created successfully",
            data:hierarchy
        });


    }
    catch(error){
        next(error);
    }

};




// Get All

exports.getAllHierarchy = async(req,res,next)=>{

    try{

        const hierarchy =
        await hierarchyService.getAllHierarchy();


        res.status(200).json({
            success:true,
            data:hierarchy
        });

    }
    catch(error){
        next(error);
    }

};




// Get By Id

exports.getHierarchyById = async(req,res,next)=>{

    try{

        const hierarchy =
        await hierarchyService.getHierarchyById(
            req.params.id
        );


        res.status(200).json({
            success:true,
            data:hierarchy
        });


    }
    catch(error){
        next(error);
    }

};




// Update

exports.updateHierarchy = async(req,res,next)=>{

    try{

        const hierarchy =
        await hierarchyService.updateHierarchy(
            req.params.id,
            req.body
        );


        res.status(200).json({
            success:true,
            message:"Hierarchy updated",
            data:hierarchy
        });


    }
    catch(error){
        next(error);
    }

};




// Delete

exports.deleteHierarchy = async(req,res,next)=>{

    try{

        await hierarchyService.deleteHierarchy(
            req.params.id
        );


        res.status(200).json({
            success:true,
            message:"Hierarchy deleted"
        });


    }
    catch(error){
        next(error);
    }

};