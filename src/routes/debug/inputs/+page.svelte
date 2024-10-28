<script lang="ts">
    // Regular Imports
    import { browser } from "$app/environment";

    // Buttons
    import TabbedPane from "../../../components/inputs/button/tabs/TabbedPane.svelte";
    import TabButton from "../../../components/inputs/button/tabs/TabButton.svelte";
    import BoxButton from "../../../components/inputs/button/BoxButton.svelte";
    import ButtonInner from "../../../components/inputs/button/ButtonInner.svelte";
    import ButtonLink from "../../../components/inputs/button/ButtonLink.svelte";
    import ButtonLinkNewTab from "../../../components/inputs/button/ButtonLinkNewTab.svelte";
    import ButtonReact from "../../../components/inputs/button/ButtonReact.svelte";
    import NavButton from "../../../components/inputs/button/NavButton.svelte";
    import SleekButton from "../../../components/inputs/button/SleekButton.svelte";

    // Multi
    import KvMultiInput from "../../../components/inputs/multi/kv/KVMultiInput.svelte";
    import KvMultiInputElement from "../../../components/inputs/multi/kv/KVMultiInputElement.svelte";
    import MultiInput from "../../../components/inputs/multi/simple/MultiInput.svelte";
    import Button from "../../../components/inputs/multi/Button.svelte";
    import DangerButton from "../../../components/inputs/multi/DangerButton.svelte";

    // Select
    import RawSelect from "../../../components/inputs/select/RawSelect.svelte";
    import RawSelectMulti from "../../../components/inputs/select/RawSelectMulti.svelte";
    import Select from "../../../components/inputs/select/Select.svelte";
    import SelectMulti from "../../../components/inputs/select/SelectMulti.svelte";

    // Etc
    import BitflagInput from "../../../components/inputs/BitflagInput.svelte";
    import BoolInput from "../../../components/inputs/BoolInput.svelte";
    import ChannelInput from "../../../components/inputs/ChannelInput.svelte";
    import FileUpload from "../../../components/inputs/FileUpload.svelte";
    import InputDescription from "../../../components/inputs/InputDescription.svelte";
    import InputNumber from "../../../components/inputs/InputNumber.svelte";
    import InputText from "../../../components/inputs/InputText.svelte";
    import InputTextArea from "../../../components/inputs/InputTextArea.svelte";
    import Label from "../../../components/inputs/Label.svelte";
    import Modifier from "../../../components/inputs/Modifier.svelte";
    import RoleInput from "../../../components/inputs/RoleInput.svelte";
    import Spacer from "../../../components/inputs/Spacer.svelte";

    // Button Function
    const debugButton = () => {
        if (browser) alert("This is a debug button.");
    };

    // Value(s)
    export let textValue: string;
    export let boolValue: boolean;
    export let numberValue: number;
    export let fileValue: File;
</script>

<div class="debug">
    <section id="text">
        <h2>Text Inputs:</h2>
        <div class="p-2" />

        <div id="regular_text">
            <InputText 
                id="debug"
                label="Regular Text"
                placeholder="Debug Text"
                minlength={0}
                bind:value={textValue}
            />
        </div>

        <!-- Continue with Text Inputs -->
    </section>

    <div class="p-2" />
    
    <!-- Continue with other Input Types with same layout-->
</div>