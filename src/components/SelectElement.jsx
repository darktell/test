import Select from "react-select";
import React from "react";

const MOCK_OPTIONS = [{value:"1", label:" var 1"}, {value:"2", label:" var 2"}, {value:"3", label:" var 3"}]

const SelectElement = ({ attributes, children, element }) => {
    return (
        <div contentEditable={false} className="flex items-center bg-lime-200 py-1 px-2 rounded-full">
            <span className="pr-1">
                New variable
            </span>
            <Select
                className="basic-single"
                classNamePrefix="select"
                isSearchable={true}
                name="var"
                options={MOCK_OPTIONS}
            />
        </div>
    );
};

export default SelectElement;