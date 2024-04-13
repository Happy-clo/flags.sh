import { useRef, useState } from "react";
import { Switch } from "@mantine/core";
import { OptionModal, OptionModalRef, ToggleState, InputCaption } from "@encode42/mantine-extras";
import { ModalProps } from "./interface/ModalProps";

/**
 * 标志模态窗口的属性。
 */
export interface FlagModalProps extends ModalProps {
    /**
     * 是否为现代Java Hotspot版本添加试验性向量标志。
     */
    "defaultModernVectors": ToggleState
}

/**
 * 附加标志选项的模态窗口。
 */
export function FlagModal({ open, defaultModernVectors }: FlagModalProps) {
    const [pendingModernVectors, setPendingModernVectors] = useState<boolean>(defaultModernVectors.value);

    const modernVectors = {
        "set": setPendingModernVectors,
        "value": pendingModernVectors,
        "default": defaultModernVectors.value
    };

    const dataModal = useRef<OptionModalRef>(null);

    return (
        <OptionModal open={open} ref={dataModal} values={[modernVectors]} onApply={() => {
            defaultModernVectors.set(modernVectors.value);
        }}>
            {/* 现代Java开关 */}
            <InputCaption text="添加一个标志，启用试验性的SIMD向量，显著提速地图项渲染。仅适用于基于Pufferfish的分支和运行Java 17 Hotspot的服务器。">
                <Switch label="Modern vector" checked={modernVectors.value} disabled={defaultModernVectors.disabled} onChange={event => {
                    modernVectors.set(event.target.checked);
                }} />
            </InputCaption>
        </OptionModal>
    );
}