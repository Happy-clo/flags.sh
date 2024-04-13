import { useRef, useState } from "react";
import { NumberInput, Switch } from "@mantine/core";
import { OptionModal, OptionModalRef, NumberState, ToggleState, InputCaption, Label } from "@encode42/mantine-extras";
import { ModalProps } from "./interface/ModalProps";

// TODO: 同时以MB显示内存输入

/**
 * 内存模态窗口的属性。
 */
export interface MemoryModalProps extends ModalProps {
    /**
     * 分配的内存量（以GB为单位）。
     */
    "defaultMemory": NumberState,

    /**
     * 是否为Pterodactyl容器计算额外的内存开销。
     */
    "defaultPterodactyl": ToggleState
};

export function MemoryModal({ open, defaultMemory, defaultPterodactyl }: MemoryModalProps) {
    const [pendingMemory, setPendingMemory] = useState<number>(defaultMemory.value);
    const [pendingPterodactyl, setPendingPterodactyl] = useState<boolean>(defaultPterodactyl.value);

    const memoryValue = {
        "set": setPendingMemory,
        "value": pendingMemory,
        "default": defaultMemory.value
    };

    const pterodactylValue = {
        "set": setPendingPterodactyl,
        "value": pendingPterodactyl,
        "default": defaultPterodactyl.value
    };

    const dataModal = useRef<OptionModalRef>(null);

    return (
        <OptionModal open={open} values={[memoryValue, pterodactylValue]} ref={dataModal} onApply={() => {
            defaultMemory.set(memoryValue.value);
            defaultPterodactyl.set(pterodactylValue.value);
        }}>
            {/* 精确内存选择器 */}
            <Label label="分配内存 (GB)">
                <NumberInput value={memoryValue.value} min={0} step={0.05} precision={2} onChange={value => {
                    if (!value) {
                        return;
                    }

                    memoryValue.set(value);
                }} />
            </Label>

            {/* Pterodactyl额外开销开关 */}
            <InputCaption text="为了考虑Java在容器内的开销，分配物理机器内存的85%，并添加与控制台相关的标志。仅适用于Java命令标签页。">
                <Switch label="Pterodactyl" checked={pterodactylValue.value} disabled={defaultPterodactyl.disabled} onChange={event => {
                    pterodactylValue.set(event.target.checked);
                }} />
            </InputCaption>
        </OptionModal>
    );
}