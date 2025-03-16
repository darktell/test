import React from "react";

const TagElement = ({ attributes, children, element }) => {
    return (
        <span contentEditable={false} className="inline-flex items-center mx-1 my-0 bg-lime-200 p-1 rounded-full text-xs">
            {children}
        </span>
    );
};

export default TagElement