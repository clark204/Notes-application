import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import { RichEditor } from "react-native-pell-rich-editor";

export type NoteEditorRef = {
    addCheckbox: () => void;
    getHTML: () => Promise<string>;
    bold: () => void;
    italic: () => void;
    underline: () => void;
    setFontSize: (size: number) => void;
    commandDOM: (command: string) => void;
    loadContent: (html: string) => void;
};

type Props = {
    onChange?: (html: string) => void;
};

const NoteEditor = forwardRef<NoteEditorRef, Props>(({ onChange }, ref) => {
    const richText = useRef<RichEditor>(null);

    const checkboxEnterScript = `
    (function() {
        var style = document.createElement('style');
        style.innerHTML = 'p { margin: 0; padding: 0; line-height: 1.5; } body { margin: 0; } .cb-done { text-decoration: line-through; color: #aaa; } input[type="checkbox"] { pointer-events: none; }';
        document.head.appendChild(style);

        document.addEventListener('click', function(e) {
            var p = e.target.closest('p');
            if (!p) return;
            var cb = p.querySelector('input[type="checkbox"]');
            if (!cb) return;
            // only toggle if clicking on the checkbox area (left side)
            var rect = p.getBoundingClientRect();
            var clickX = e.clientX - rect.left;
            if (clickX > 40) return; // 👈 only toggle if tap is within 40px from left
            cb.checked = !cb.checked;
            var span = p.querySelector('span');
            if (span) {
                if (cb.checked) {
                    span.classList.add('cb-done');
                } else {
                    span.classList.remove('cb-done');
                }
            }
        });

        document.addEventListener('input', function(e) {
            if (e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak') {
                var sel = window.getSelection();
                if (!sel || !sel.rangeCount) return;
                var node = sel.getRangeAt(0).startContainer;
                while (node && node.nodeName !== 'P') { node = node.parentNode; }
                if (!node) return;
                var isCheckbox = node.querySelector && node.querySelector('input[type="checkbox"]');
                if (isCheckbox) {
                    document.execCommand('undo');
                    var newP = document.createElement('p');
                    newP.innerHTML = '<br>';
                    node.after(newP);
                    var r = document.createRange();
                    r.setStart(newP, 0);
                    r.collapse(true);
                    var s = window.getSelection();
                    s.removeAllRanges();
                    s.addRange(r);
                }
            }
        });
    })();
    true;
`;

    useImperativeHandle(ref, () => ({
        addCheckbox: () => {
            const id = `cb-${Date.now()}`;
            richText.current?.insertHTML(
                `<p id="${id}" style="display:flex;align-items:center;gap:10px;margin:0;line-height:1.5;"><input type="checkbox" contenteditable="false" tabindex="-1" style="margin:0;flex-shrink:0;width:22px;height:22px;pointer-events:none;accent-color:#453A49;"/><span contenteditable="true" style="flex:1;min-height:1.5em;line-height:1.5;outline:none;padding-left:2px;display:inline-block;vertical-align:middle;"></span></p>`
            );
            setTimeout(() => {
                richText.current?.commandDOM(`
                    var p = document.getElementById('${id}');
                    if (p) {
                        p.removeAttribute('id');
                        var span = p.querySelector('span');
                        if (span) span.focus();
                    }
                `);
            }, 100);
        },
        getHTML: async () => {
            return await richText.current?.getContentHtml() ?? "";
        },
        bold: () => {
            richText.current?.commandDOM(`document.execCommand('bold')`);
        },
        italic: () => {
            richText.current?.commandDOM(`document.execCommand('italic')`);
        },
        underline: () => {
            richText.current?.commandDOM(`document.execCommand('underline')`);
        },
        setFontSize: (size: number) => {
            richText.current?.commandDOM(`document.execCommand('fontSize', false, '${size}')`);
        },
        commandDOM: (command: string) => {
            richText.current?.commandDOM(command);
        },
        loadContent: (html: string) => {
            richText.current?.setContentHTML(html);
        },
    }));

    return (
        <RichEditor
            ref={richText}
            style={styles.editor}
            placeholder="Start typing your note..."
            onChange={onChange}
            initialContentHTML=""
            initialFocus={true}
            injectedJavaScript={checkboxEnterScript}
            editorStyle={{
                backgroundColor: "transparent",
                color: "#333",
                contentCSSText: "font-size: 16px; padding: 10px 20px; line-height: 1.5; border-top: solid 1px;",
            }}
        />
    );
});

export default NoteEditor;

const styles = StyleSheet.create({
    editor: {
        flex: 1,
        backgroundColor: "transparent",
    },
});