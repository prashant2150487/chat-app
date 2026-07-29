





export const listConverstions = async (req, res, next) => {
    try {
        const { id } = req.user;
        const data = await conversationService.listForUser(req.user.id);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            data,
            message: "Conversations listed successfully",
        });
    } catch (err) {
        next(err)
    }
}

export const createDirectConversation = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { peerUserId } = req.body;
        const data = await conversationService.getOrCreateDirect(id, peerUserId)
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            data,
            message: "Direct conversation created successfully",
        });
    } catch (err) {
        next(err)
    }
}
export const getConversation = async (req,res,next) =>{
    try{
        

    }catch(err){

    }
}