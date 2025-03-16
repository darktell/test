import React, {useCallback, useEffect, useState} from 'react';
import { createEditor, Transforms, Range } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { v4 as uuidv4 } from 'uuid';
import {useQuery} from "react-query";
import TagElement from "./TagElement";
import SelectElement from "./SelectElement";
import useDropdown from "../store/dropdownStore";

const OPERATORS = ['+', '-', '*', '/', '^', '(', ')', '='];

const INITIAL_VALUE = [
    {
        type: 'paragraph',
        children: [{ text: '' }],
    },
];

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
    const { isOpen: showDropdown, toggleOpen: setShowDropdown } = useDropdown();

    const [value, setValue] = useState(INITIAL_VALUE);
    const [currentPosition, setCurrentPosition] = useState(0);
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
        if (OPERATORS.includes(event.key)) {
            const newNode = { type: 'inline', children: [{ text: ` ${event.key} ` }] };
            Transforms.insertNodes(editor, newNode);

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

    const replaceWithCustomComponent = ({name, value, type}) => {

        Transforms.delete(editor, { at: [currentPosition,0] });

        const newTag = { type: type || 'tag', value:value,  id: uuidv4(), children: [{ text: name }] };
        Transforms.insertNodes(editor, newTag);

        Transforms.insertNodes(editor, {
            type: 'paragraph',
            children: [{ text: ' ' }],
        });
    };


    const handleChangeValue = useCallback((value = "") => {
        setValue(value)
    }, []);


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
            const mergedData = [...data, {value: 0, name:"new variable", type: "select"}]

            setShowDropdown(true)
            setDropdownResults(mergedData?.filter(({name})=> name.includes(currPositionValue)))
        }else {
            setShowDropdown(false)
            setDropdownResults([])
        }
    }, [value, currentPosition]);

    useEffect(() => {
        setCurrentPosition(getCursorPosition())
    }, [value]);

    if (isLoading){
        return <div>Loading...</div>
    }

    return (
        <Slate
            editor={editor}
            value={value}
            onChange={(newValue) => handleChangeValue(newValue)}
            onSelectionChange={onSelectionChange}
            initialValue={INITIAL_VALUE}
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
                {dropdownResults?.map(({name, type, value}, index)=>
                    <div key={name + index}
                         className="p-2 hover:bg-lime-200"
                         onClick={()=>replaceWithCustomComponent({name, value, type})}
                    >
                        {name}
                    </div>
                )}
            </div>}
        </Slate>
    );
};

export default FormulaInput;