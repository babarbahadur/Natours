const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAll = Model =>
    catchAsync(async (req, res, next) => {
        const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

        // const document = await features.query.explain()
        const document = await features.query;

        if(!document) {
            return next(new AppError('No document found', 404))
        } 
        res
        .status(200)
        .json({
            message: 'Success', 
            length: document.length, 
            data: {
                data: document
            }
        })
    })

exports.deleteOne = Model => 
    catchAsync(async (req, res, next) => {
        const document = await Model.findByIdAndDelete(req.params.id)

        if(!document) {
            return next(new AppError('No document found', 404))
        } 
        
        res
        .status(204)
        .json({
            message: 'Document deleted sucessfully',
        })
    })

exports.patchOne = Model => 
    catchAsync(async (req, res, next) => {
        const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        if(!document) {
            return next(new AppError('No document found', 404))
        } 

        res
        .status(200)
        .json({
            message: 'Data patch sucessfully!',
            data: {
                data: document
            }
        })
    })

exports.getOne = (Model, populateOptions) => 
    catchAsync(async (req, res, next) => {
        let querry = Model.findById(req.params.id)
        if(populateOptions) querry = querry.populate(populateOptions)

        const document = await querry

        // const document = await Model.findById(req.params.id).populate('reviews')

        if(!document) {
            return next(new AppError('No tour found with that ID', 404))
        } 

        res
        .status(200)
        .json({
            message: 'Success',
            data: {
                data: document
            }
        })
    })