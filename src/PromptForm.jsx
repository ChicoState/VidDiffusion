
import React from 'react';
import { Button } from "./Components.jsx";

export const PromptForm = () => {
    function handleSubmit(e) {
        // prevent the browser from reloading the page
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const formJson = Object.fromEntries(formData.entries());

        console.log(formJson);
    }

    return (
        <form method="post" onSubmit={handleSubmit}>
            <label>
                <textarea className="border-black rounded-md resize-y w-full border-2 p-2" name="prompt" />
            </label>
            <hr />
            <Button type="reset">Reset form</Button>
            <hr />
            <Button type="submit">Submit form</Button>
        </form>
    );
};

