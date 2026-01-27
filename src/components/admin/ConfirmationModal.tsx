import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  impacts?: string[];
  confirmText?: string;
  requiresTypedConfirmation?: boolean;
  confirmButtonText?: string;
  confirmButtonVariant?: "default" | "destructive" | "gold";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export default function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  impacts = [],
  confirmText = "CONFIRM",
  requiresTypedConfirmation = true,
  confirmButtonText = "Confirm",
  confirmButtonVariant = "destructive",
  isLoading = false,
  onConfirm,
}: ConfirmationModalProps) {
  const [typedText, setTypedText] = useState("");

  const canConfirm = !requiresTypedConfirmation || typedText === confirmText;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    await onConfirm();
    setTypedText("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTypedText("");
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-charcoal border-border max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {impacts.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium text-destructive">Impact:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {impacts.map((impact, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  {impact}
                </li>
              ))}
            </ul>
          </div>
        )}

        {requiresTypedConfirmation && (
          <div className="space-y-2">
            <Label htmlFor="confirm-input" className="text-sm text-muted-foreground">
              Type "{confirmText}" to proceed:
            </Label>
            <Input
              id="confirm-input"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={confirmText}
              className="bg-background border-border"
              autoComplete="off"
            />
          </div>
        )}

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmButtonText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
