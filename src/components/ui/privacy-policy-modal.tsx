import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/enhanced-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, Eye, Users, FileText } from "lucide-react";

interface PrivacyPolicyModalProps {
  businessName: string;
  contactEmail: string;
  trigger?: React.ReactNode;
}

const PrivacyPolicyModal = ({ 
  businessName, 
  contactEmail, 
  trigger 
}: PrivacyPolicyModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
      Política de Privacidade
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Política de Privacidade - LGPD
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Introdução */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                1. Introdução
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A {businessName} está comprometida com a proteção da sua privacidade e 
                com o cumprimento da Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). 
                Esta política explica como coletamos, usamos e protegemos suas informações pessoais.
              </p>
            </section>

            {/* Dados Coletados */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                2. Dados Coletados
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Dados de Identificação:</strong> Nome, e-mail, telefone</p>
                <p><strong>Dados de Navegação:</strong> Informações sobre sua visita ao site</p>
                <p><strong>Cookies:</strong> Pequenos arquivos para melhorar sua experiência</p>
                <p><strong>Dados de Comunicação:</strong> Mensagens enviadas através do chat</p>
              </div>
            </section>

            {/* Finalidade */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-primary" />
                3. Finalidade do Uso
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Fornecer e melhorar nossos serviços</p>
                <p>• Entrar em contato sobre produtos e serviços</p>
                <p>• Personalizar sua experiência</p>
                <p>• Cumprir obrigações legais</p>
                <p>• Prevenir fraudes e atividades maliciosas</p>
              </div>
            </section>

            {/* Compartilhamento */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-primary" />
                4. Compartilhamento de Dados
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, 
                exceto quando necessário para a prestação do serviço, cumprimento de 
                obrigações legais ou com seu consentimento explícito.
              </p>
            </section>

            {/* Segurança */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                5. Segurança dos Dados
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas e organizacionais adequadas para proteger 
                seus dados contra acesso não autorizado, alteração, divulgação ou destruição. 
                Utilizamos criptografia e protocolos de segurança atualizados.
              </p>
            </section>

            {/* Direitos do Titular */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                6. Seus Direitos (LGPD)
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Confirmação:</strong> Saber se tratamos seus dados</p>
                <p><strong>Acesso:</strong> Consultar seus dados</p>
                <p><strong>Correção:</strong> Corrigir dados incompletos ou incorretos</p>
                <p><strong>Anonimização:</strong> Tornar dados anônimos</p>
                <p><strong>Portabilidade:</strong> Transferir dados para outro fornecedor</p>
                <p><strong>Eliminação:</strong> Excluir dados desnecessários</p>
                <p><strong>Oposição:</strong> Se opor ao tratamento</p>
                <p><strong>Revogação:</strong> Retirar consentimento</p>
              </div>
            </section>

            {/* Retenção */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                7. Retenção de Dados
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Seus dados serão mantidos pelo tempo necessário para cumprir as finalidades 
                descritas nesta política, ou conforme exigido por lei. Após esse período, 
                os dados serão anonimizados ou excluídos de forma segura.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-primary" />
                8. Cookies
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento do site e cookies 
                analíticos para melhorar sua experiência. Você pode gerenciar suas 
                preferências de cookies nas configurações do seu navegador.
              </p>
            </section>

            {/* Contato */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-primary" />
                9. Contato
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política:</p>
                <p><strong>E-mail:</strong> {contactEmail}</p>
                <p><strong>Empresa:</strong> {businessName}</p>
              </div>
            </section>

            {/* Alterações */}
            <section>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                10. Alterações na Política
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Esta política pode ser atualizada periodicamente. Recomendamos revisar 
                esta página regularmente para se manter informado sobre nossas práticas 
                de privacidade.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setIsOpen(false)}>
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;