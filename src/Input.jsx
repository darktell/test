import React, {useCallback, useEffect, useState} from 'react';
import { createEditor, Transforms, Text, Range, Node,Editor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import Select from 'react-select';
import { v4 as uuidv4 } from 'uuid';
import {useQuery} from "react-query";

const operators = ['+', '-', '*', '/', '^', '(', ')', '='];

const initialValue = [
    {
        type: 'paragraph',
        children: [{ text: '' }],
    },
];

const TagElement = ({ attributes, children, element }) => {
    return (
        <span contentEditable={false} className="inline-flex items-center mx-1 my-0 bg-lime-200 p-1 rounded-full text-xs">
            {children}
        </span>
    );
};

const SelectElement = ({ attributes, children, element }) => {
    return (
        <div contentEditable={false} className="flex items-center bg-lime-200 p-1 rounded-full">
            <span className="pr-1">
                New variable
            </span>
                <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    name="var"
                    options={[{value:"1", label:" var 1"}, {value:"2", label:" var 2"}, {value:"3", label:" var 3"}]}
                />
        </div>
    );
};

const fetchData = async () => {
    const response = await fetch('https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete');
    if (!response.ok) {
        throw new Error('Network error');
    }
    return response.json();
};

const FormulaInput = () => {
    const editor = React.useMemo(() => withReact(createEditor()), []);

    const { data, isLoading } = useQuery('tags', fetchData);
    const [value, setValue] = useState(initialValue);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownResults, setDropdownResults] = useState([]);

    const renderElement = useCallback((props) => {
        switch (props.element.type) {
            case 'tag':
                return <TagElement {...props } />;
            case  'select':
                return <SelectElement {...props} />;
            default:
                return <span className="inline-flex items-center" {...props.attributes}>{props.children}</span>;
        }
    }, []);

    const handleKeyDown = (event) => {
        if (operators.includes(event.key)) {
            const newNode = { type: 'inline', children: [{ text: ` ${event.key} ` }] };
            Transforms.insertNodes(editor, newNode);

            Transforms.insertNodes(editor, {
                type: 'paragraph',
                children: [{ text: '' }],
            });
            event.preventDefault();
        }

        // if (event.key === '@') {
        //     const newTag = { type: 'tag', value: "test", id: uuidv4(), children: [{ text: 'case 1' }] };
        //     Transforms.insertNodes(editor, newTag);
        //
        //     Transforms.insertNodes(editor, {
        //         type: 'paragraph',
        //         children: [{ text: '' }],
        //     });
        //     event.preventDefault();
        // }

        if (event.key === '@') {
            const newTag = { type: 'select', value: "test", id: uuidv4(), children: [{ text: '' }] };
            Transforms.insertNodes(editor, newTag);

            Transforms.insertNodes(editor, {
                type: 'paragraph',
                children: [{ text: '' }],
            });
            event.preventDefault();
        }

        // delete prev custom element element
        if (event.key === 'Backspace' && !value?.[currentPosition]?.children[0]?.text && (value?.[currentPosition-1]?.type === 'tag' || value?.[currentPosition-1]?.type === 'select')) {
            Transforms.delete(editor, { at: [currentPosition-1,0] });
        }
    };


    const handleChange = useCallback((value = "") => {
        console.log(value)
        setValue(value)
    }, []);

    // const handleSelectSuggestion = (suggestion) => {
    //     const newText = `${inputValue} ${suggestion}`;
    //     setInputValue(newText);
    //     setShowDropdown(false);
    //     Transforms.insertText(editor, newText);
    // };

    const getCursorPosition = () => {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
            const [point] = Range.edges(selection);
            return point?.path[0];
        }
        return null;
    };

    const onSelectionChange = (data) => {
        setCurrentPosition(data.anchor?.path[0])
    }

    useEffect(() => {
        const currPositionValue = value?.[currentPosition]?.children?.[0]?.text.trim()

        if (currPositionValue && isNaN(currPositionValue) && (value[currentPosition-1]?.type === 'inline' || currentPosition === 0) ) {
            setShowDropdown(true)
            setDropdownResults(data?.filter(({name})=> name.includes(currPositionValue)))
            console.log(data?.filter(({name})=> name.includes(currPositionValue)))
        }else {
            setShowDropdown(false)
            setDropdownResults([])
        }
    }, [value, currentPosition]);

    useEffect(() => {
        setCurrentPosition(getCursorPosition())
    }, [value]);

    const replaceWithCustomComponent = () => {
        Transforms.delete(editor, { at: [0,0] });

        const newTag = { type: 'custom', value: '@variable', id: uuidv4(), children: [{ text: '' }] };
        Transforms.insertNodes(editor, newTag);

        Transforms.insertNodes(editor, {
            type: 'paragraph',
            children: [{ text: '' }],
        });

    };

    if (isLoading){
        return <div>Loading...</div>
    }

    return (
        <Slate
            editor={editor}
            value={value}
            onChange={(newValue) => handleChange(newValue)}
            onSelectionChange={onSelectionChange}
            initialValue={initialValue}
            className="flex flex-col"
        >
            <div className="max-w-[1000px] w-full flex gap-4">
                <Editable
                    renderElement={renderElement}
                    placeholder="Enter your formula..."
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    className="outline-none flex p-4  border border-red-300 rounded-lg flex-1"
                />
                <button className="bg-amber-400 rounded-lg outline-none p-4">Submit</button>
            </div>
            {showDropdown && <div className="max-h-[400px] overflow-auto max-w-[1000px] p-4 space-x-1">
                {dropdownResults?.map(({name}, index)=><div key={name + index} className="p-2 hover:bg-lime-200">{name}</div>)}
            </div>}
        </Slate>
    );
};

export default FormulaInput;